from typing import Optional
from sqlmodel import SQLModel


class DatSubjekPajakResponse(SQLModel):
    """Response model for dat_subjek_pajak data"""

    SUBJEK_PAJAK_ID: str
    NM_WP: Optional[str] = None
    JALAN_WP: Optional[str] = None
    BLOK_KAV_NO_WP: Optional[str] = None
    RW_WP: Optional[str] = None
    RT_WP: Optional[str] = None
    KELURAHAN_WP: Optional[str] = None
    KOTA_WP: Optional[str] = None
    KD_POS_WP: Optional[str] = None
    TELP_WP: Optional[str] = None
    NPWP: Optional[str] = None
    STATUS_PEKERJAAN_WP: Optional[str] = None
    EMAIL_WP: Optional[str] = None
