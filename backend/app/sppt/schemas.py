from sqlmodel import SQLModel, inspect
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class VerifikasiRequest(SQLModel):
    SUBJEK_PAJAK_ID: str
    NM_WP: str
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    TELP_WP: str


class SpopResponse(SQLModel):
    NM_WP: Optional[str] = None
    JNS_TRANSAKSI_OP: str
    KD_PROPINSI_ASAL: Optional[str] = None
    JALAN_OP: Optional[str] = None
    JNS_BUMI: Optional[str] = None
    NIP_PEMERIKSA_OP: Optional[str] = None
    KD_PROPINSI_BERSAMA: Optional[str] = None
    KD_DATI2_ASAL: Optional[str] = None
    BLOK_KAV_NO_OP: Optional[str] = None
    NILAI_SISTEM_BUMI: int
    NO_PERSIL: Optional[str]
    KD_BLOK: str
    KD_DATI2_BERSAMA: Optional[str] = None
    KD_KECAMATAN_ASAL: Optional[str] = None
    KELURAHAN_OP: Optional[str] = None
    TGL_PENDATAAN_OP: date
    KD_DATI2: str
    KD_KECAMATAN_BERSAMA: Optional[str] = None
    KD_KELURAHAN_ASAL: Optional[str] = None
    RW_OP: Optional[str] = None
    NM_PENDATAAN_OP: Optional[str] = None
    NO_URUT: str
    KD_KELURAHAN_BERSAMA: Optional[str] = None
    KD_BLOK_ASAL: Optional[str] = None
    RT_OP: Optional[str] = None
    KD_KELURAHAN: str
    KD_JNS_OP: str
    KD_BLOK_BERSAMA: Optional[str] = None
    NO_URUT_ASAL: Optional[str] = None
    KD_STATUS_WP: Optional[str] = None
    NIP_PENDATA: Optional[str] = None
    KD_PROPINSI: str
    KD_KECAMATAN: str
    SUBJEK_PAJAK_ID: str
    NO_URUT_BERSAMA: Optional[str] = None
    KD_JNS_OP_ASAL: Optional[str] = None
    LUAS_BUMI: int
    TGL_PEMERIKSAAN_OP: date
    NO_FORMULIR_SPOP: Optional[str] = None
    KD_JNS_OP_BERSAMA: Optional[str] = None
    NO_SPPT_LAMA: Optional[str] = None
    KD_ZNT: Optional[str] = None
    NM_PEMERIKSAAN_OP: Optional[str] = None


class PaginationMeta(SQLModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class SpopPaginatedResponse(SQLModel):
    data: List[SpopResponse]
    meta: PaginationMeta


class SpptResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    THN_PAJAK_SPPT: str
    NM_WP_SPPT: Optional[str] = None
    JLN_WP_SPPT: Optional[str] = None
    BLOK_KAV_NO_WP_SPPT: Optional[str] = None
    RW_WP_SPPT: Optional[str] = None
    RT_WP_SPPT: Optional[str] = None
    KELURAHAN_WP_SPPT: Optional[str] = None
    KOTA_WP_SPPT: Optional[str] = None
    KD_POS_WP_SPPT: Optional[str] = None
    NPWP_SPPT: Optional[str] = None
    TGL_JATUH_TEMPO_SPPT: Optional[date] = None
    LUAS_BUMI_SPPT: Optional[int] = None
    LUAS_BNG_SPPT: Optional[int] = None
    NJOP_BUMI_SPPT: Optional[int] = None
    NJOP_BNG_SPPT: Optional[int] = None
    NJOP_SPPT: Optional[int] = None
    NJOPTKP_SPPT: Optional[int] = None
    NJKP_SPPT: Optional[int] = None
    PBB_TERHUTANG_SPPT: Optional[int] = None
    PBB_YG_HARUS_DIBAYAR_SPPT: Optional[int] = None
    STATUS_PEMBAYARAN_SPPT: Optional[bool] = None
    STATUS_TAGIHAN_SPPT: Optional[bool] = None
    TGL_TERBIT_SPPT: Optional[datetime] = None


class SpptYearResponse(SQLModel, table=False):  # not a table
    THN_PAJAK_SPPT: str
    count: int


class SpptYearsResponse(SQLModel):
    available_years: List[SpptYearResponse]


class SpptPaginatedResponse(SQLModel):
    data: List[SpptResponse]
    meta: PaginationMeta


# Add new response models for object listing
class SpptObjectResponse(SQLModel):
    KD_PROPINSI: str
    KD_DATI2: str
    KD_KECAMATAN: str
    KD_KELURAHAN: str
    KD_BLOK: str
    NO_URUT: str
    KD_JNS_OP: str
    NM_WP_SPPT: Optional[str] = None
    KELURAHAN_WP_SPPT: Optional[str] = None


class SpptObjectPaginatedResponse(SQLModel):
    data: List[SpptObjectResponse]
    meta: PaginationMeta
