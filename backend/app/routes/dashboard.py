from fastapi import APIRouter, Depends
from sqlmodel import select, func
from app.core.deps import SessionDep, get_token
from app.auth.service import get_current_user
from app.models.sppt import Sppt
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    # Get total SPPT count
    total_sppt = await session.scalar(
        select(func.count()).select_from(Sppt)
    )

    # Get paid SPPT count
    total_sppt_lunas = await session.scalar(
        select(func.count())
        .select_from(Sppt)
        .where(Sppt.STATUS_PEMBAYARAN_SPPT == True)
    )

    # Get unpaid SPPT count
    total_sppt_belum_lunas = await session.scalar(
        select(func.count())
        .select_from(Sppt)
        .where(Sppt.STATUS_PEMBAYARAN_SPPT == False)
    )

    # Get total PBB amount
    total_pbb_terhutang = await session.scalar(
        select(func.sum(Sppt.PBB_TERHUTANG_SPPT)).select_from(Sppt)
    )

    return {
        "total_sppt": total_sppt or 0,
        "total_sppt_lunas": total_sppt_lunas or 0,
        "total_sppt_belum_lunas": total_sppt_belum_lunas or 0,
        "total_pbb_terhutang": float(total_pbb_terhutang or 0),
    }