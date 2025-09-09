from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime


class DatSubjekPajak(SQLModel, table=True):
    __tablename__ = "dat_subjek_pajak"

    SUBJEK_PAJAK_ID: str = Field(primary_key=True, max_length=90)
    NM_WP: Optional[str] = Field(default=None, max_length=90)
    JALAN_WP: Optional[str] = Field(default=None, max_length=90)
    BLOK_KAV_NO_WP: Optional[str] = Field(default=None, max_length=45)
    RW_WP: Optional[str] = Field(default=None, max_length=6)
    RT_WP: Optional[str] = Field(default=None, max_length=9)
    KELURAHAN_WP: Optional[str] = Field(default=None, max_length=90)
    KOTA_WP: Optional[str] = Field(default=None, max_length=90)
    KD_POS_WP: Optional[str] = Field(default=None, max_length=15)
    TELP_WP: Optional[str] = Field(default=None, max_length=60)
    NPWP: Optional[str] = Field(default=None, max_length=45)
    STATUS_PEKERJAAN_WP: Optional[str] = Field(default=None, max_length=3)
    EMAIL_WP: Optional[str] = Field(default=None, max_length=150)
