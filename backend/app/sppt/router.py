from functools import partial
import logging
import re
from typing import Annotated, Literal, Optional
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordRequestForm,
)
from sqlmodel import and_, func, or_, select, update
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel

from app.auth import service
from app.auth.oauth_google import get_google_oauth_url, handle_google_callback
from app.core import security
from app.auth.exceptions import credentials_exception
from app.core.config import settings
from app.core.deps import SessionDep, TokenDep, get_token
from app.models.base import APIMessage
from app.models.schemas import ErrorResponse
from app.models.spop import Spop
from app.models.sppt import Sppt
from app.models.dat_subjek_pajak import DatSubjekPajak
from app.models.user import User
from .schemas import (
    SpopPaginatedResponse,
    SpopResponse,
    VerifikasiRequest,
    SpptResponse,
    SpptYearResponse,
    SpptYearsResponse,
    SpptPaginatedResponse,
    SpptObjectPaginatedResponse,
)
from app.core.database import get_async_session
from sqlalchemy.dialects import mysql


# --- Request/Response Schemas for OpenAPI ---
class SpptCompositeKeyRequest(BaseModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str


class ExistsResponse(BaseModel):
    exists: bool


router = APIRouter(tags=["op"])


# {
#   "SUBJEK_PAJAK_ID": "1271025502730004",
#   "NM_WP": "NI WAYAN MURNIASIH",
#   "KD_PROPINSI": "51",
#   "KD_DATI2": "02",
#   "KD_KECAMATAN": "030",
#   "KD_KELURAHAN": "001",
#   "KD_BLOK": "024",
#   "NO_URUT": "0018",
#   "KD_JNS_OP": "0",
#   "TELP_WP": "123456789",
# }
@router.post("/verifikasi", response_model=ExistsResponse)
async def verifikasi(
    data: VerifikasiRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user_allow_inactive),
):
    query = (
        select(Spop)
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            normalize_mysql5(Spop.SUBJEK_PAJAK_ID) == normalize(data.SUBJEK_PAJAK_ID),
            normalize_mysql5(DatSubjekPajak.NM_WP) == normalize(data.NM_WP),
            Spop.KD_PROPINSI == data.KD_PROPINSI,
            Spop.KD_DATI2 == data.KD_DATI2,
            Spop.KD_KECAMATAN == data.KD_KECAMATAN,
            Spop.KD_KELURAHAN == data.KD_KELURAHAN,
            Spop.KD_BLOK == data.KD_BLOK,
            Spop.NO_URUT == data.NO_URUT,
            Spop.KD_JNS_OP == data.KD_JNS_OP,
        )
        .limit(1)
    )
    print(
        query.compile(dialect=mysql.dialect(), compile_kwargs={"literal_binds": True})
    )

    result = await session.exec(query)
    exists = result.first() is not None
    if exists:
        # Update subjek_pajak_id where EMAIL_WP matches current_user.email
        await session.exec(
            select(User)
            .where(User.id == current_user.id)
            .execution_options(synchronize_session="fetch")
        )
        await session.exec(
            update(DatSubjekPajak)
            .where(DatSubjekPajak.SUBJEK_PAJAK_ID == data.SUBJEK_PAJAK_ID)
            .values(
                {
                    "EMAIL_WP": current_user.email,
                    "TELP_WP": data.TELP_WP,
                }
            )
        )
        current_user.is_active = True
        await session.commit()

    return ExistsResponse(exists=exists)


@router.get("/spop", response_model=SpopPaginatedResponse)
async def get_all_spop(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
    search: Optional[str] = Query(None, description="Search by NM_WP"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    sort_by: Optional[Literal["KD_PROPINSI", "JALAN_OP", "LUAS_BUMI"]] = Query(
        "KD_PROPINSI"
    ),
    sort_order: Optional[Literal["asc", "desc"]] = Query("asc"),
):
    """
    List all objects (SPOP) for the current user. Use this endpoint to select an object (NOP) before choosing a year.
    """
    # Base query
    query = (
        select(Spop, DatSubjekPajak)
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email)
        )  # Make sure this is str if it's UUID
    )

    # Apply search
    if search:
        normalized_search = f"%{normalize(search)}%"
        query = query.where(
            normalize_mysql5(DatSubjekPajak.NM_WP).ilike(normalized_search)
        )

    # Sorting
    sort_column = getattr(Spop, sort_by)
    query = query.order_by(
        sort_column.asc() if sort_order == "asc" else sort_column.desc()
    )

    # Total count (subquery required for accurate count with joins/filters)
    total_query = select(func.count()).select_from(query.subquery())
    total_result = await session.exec(total_query)
    total = total_result.one() or 0

    # Pagination
    result = await session.exec(query.offset((page - 1) * per_page).limit(per_page))
    items = result.all()

    # Combine Spop and DatSubjekPajak data
    combined_data = []
    for spop, dat_subjek_pajak in items:
        data = spop.model_dump()
        if dat_subjek_pajak:
            data.update(dat_subjek_pajak.model_dump(exclude_none=True))
        combined_data.append(data)

    return {
        "data": combined_data,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


@router.get("/", response_model=ErrorResponse)
async def get_sppt(
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    print(current_user.is_active)

    return True


def parse_nop(nop: str):
    # Remove non-digit chars, then parse
    digits = "".join(filter(str.isdigit, nop))
    if len(digits) != 18:
        raise HTTPException(status_code=400, detail="NOP must be exactly 18 digits")
    return {
        "KD_PROPINSI": digits[0:2],
        "KD_DATI2": digits[2:4],
        "KD_KECAMATAN": digits[4:7],
        "KD_KELURAHAN": digits[7:10],
        "KD_BLOK": digits[10:13],
        "NO_URUT": digits[13:17],
        "KD_JNS_OP": digits[17:18],
    }


class NopRequest(BaseModel):
    nop: str


@router.post("/sppt/years", response_model=SpptYearsResponse)
async def get_sppt_years(
    req: NopRequest,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get available SPPT years for a specific object (NOP). Pass the NOP as JSON body.
    """
    key = parse_nop(req.nop)
    query = (
        select(Sppt.THN_PAJAK_SPPT, func.count().label("count"))
        .join(
            Spop,
            and_(
                Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
                Sppt.KD_DATI2 == Spop.KD_DATI2,
                Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                Sppt.KD_BLOK == Spop.KD_BLOK,
                Sppt.NO_URUT == Spop.NO_URUT,
                Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
        .group_by(Sppt.THN_PAJAK_SPPT)
    )
    result = await session.exec(query)
    rows = result.all()
    return {"available_years": [{"THN_PAJAK_SPPT": r[0], "count": r[1]} for r in rows]}


@router.get(
    "/sppt/{year}/{nop}",
    response_model=SpptResponse,
)
async def get_sppt_detail(
    year: str,
    nop: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(service.get_current_user),
):
    """
    Get detailed SPPT data for a specific property (object) and year. Use after selecting object and year. NOP is a single string.
    """
    key = parse_nop(nop)
    query = (
        select(Sppt)
        .join(
            Spop,
            and_(
                Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
                Sppt.KD_DATI2 == Spop.KD_DATI2,
                Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
                Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
                Sppt.KD_BLOK == Spop.KD_BLOK,
                Sppt.NO_URUT == Spop.NO_URUT,
                Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
            ),
        )
        .join(
            DatSubjekPajak,
            Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
        )
        .where(
            DatSubjekPajak.EMAIL_WP == str(current_user.email),
            Sppt.THN_PAJAK_SPPT == year,
            Sppt.KD_PROPINSI == key["KD_PROPINSI"],
            Sppt.KD_DATI2 == key["KD_DATI2"],
            Sppt.KD_KECAMATAN == key["KD_KECAMATAN"],
            Sppt.KD_KELURAHAN == key["KD_KELURAHAN"],
            Sppt.KD_BLOK == key["KD_BLOK"],
            Sppt.NO_URUT == key["NO_URUT"],
            Sppt.KD_JNS_OP == key["KD_JNS_OP"],
        )
    )
    result = await session.exec(query)
    sppt = result.first()
    if not sppt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SPPT not found or you don't have access to this data",
        )
    return sppt


# @router.get("/sppt/objects", response_model=SpptObjectPaginatedResponse)
# async def get_sppt_objects(
#     session: AsyncSession = Depends(get_async_session),
#     current_user: User = Depends(service.get_current_user),
#     search: Optional[str] = Query(None, description="Search by NM_WP or Kelurahan"),
#     page: int = Query(1, ge=1),
#     per_page: int = Query(10, ge=1, le=100),
# ):
#     """
#     (Deprecated) List distinct objects (NOP) linked to user via SPOP. Use /spop instead.
#     """
#     # List distinct objects (NOP) linked to user via SPOP
#     query = (
#         select(
#             Sppt.KD_PROPINSI,
#             Sppt.KD_DATI2,
#             Sppt.KD_KECAMATAN,
#             Sppt.KD_KELURAHAN,
#             Sppt.KD_BLOK,
#             Sppt.NO_URUT,
#             Sppt.KD_JNS_OP,
#             Sppt.NM_WP_SPPT,
#             Sppt.KELURAHAN_WP_SPPT,
#         )
#         .join(
#             Spop,
#             and_(
#                 Sppt.KD_PROPINSI == Spop.KD_PROPINSI,
#                 Sppt.KD_DATI2 == Spop.KD_DATI2,
#                 Sppt.KD_KECAMATAN == Spop.KD_KECAMATAN,
#                 Sppt.KD_KELURAHAN == Spop.KD_KELURAHAN,
#                 Sppt.KD_BLOK == Spop.KD_BLOK,
#                 Sppt.NO_URUT == Spop.NO_URUT,
#                 Sppt.KD_JNS_OP == Spop.KD_JNS_OP,
#             ),
#         )
#         .join(
#             DatSubjekPajak,
#             Spop.SUBJEK_PAJAK_ID == DatSubjekPajak.SUBJEK_PAJAK_ID,
#         )
#         .where(DatSubjekPajak.EMAIL_WP == str(current_user.email))
#     )

#     if search:
#         normalized = f"%{normalize(search)}%"
#         query = query.where(
#             or_(
#                 normalize_mysql5(Sppt.NM_WP_SPPT).ilike(normalized),
#                 normalize_mysql5(Sppt.KELURAHAN_WP_SPPT).ilike(normalized),
#             )
#         )

#     total_query = select(func.count()).select_from(query.subquery())
#     total = (await session.exec(total_query)).one() or 0

#     result = await session.exec(query.offset((page - 1) * per_page).limit(per_page))
#     items = result.all()

#     return {
#         "data": [dict(zip(item._fields, item)) for item in items],
#         "meta": {
#             "page": page,
#             "per_page": per_page,
#             "total": total,
#             "total_pages": (total + per_page - 1) // per_page,
#         },
#     }


def normalize_mysql5(col):
    chars_to_strip = [" ", "/", "\\", "-", "_", ".", ","]
    for ch in chars_to_strip:
        col = func.replace(col, ch, "")
    return func.lower(col)


def normalize(val: str) -> str:
    return re.sub(r"[ \\/\-_,.]", "", val.lower())
