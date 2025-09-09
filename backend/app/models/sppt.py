from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime


class Sppt(SQLModel, table=True):
    __tablename__ = "sppt"

    KD_PROPINSI: str = Field(primary_key=True, max_length=6)
    KD_DATI2: str = Field(primary_key=True, max_length=6)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=9)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=9)
    KD_BLOK: str = Field(primary_key=True, max_length=9)
    NO_URUT: str = Field(primary_key=True, max_length=12)
    KD_JNS_OP: str = Field(primary_key=True, max_length=3)
    THN_PAJAK_SPPT: str = Field(primary_key=True, max_length=12)
    SIKLUS_SPPT: Optional[int] = None
    KD_KANWIL_BANK: Optional[str] = Field(default=None, max_length=6)
    KD_KPPBB_BANK: Optional[str] = Field(default=None, max_length=6)
    KD_BANK_TUNGGAL: Optional[str] = Field(default=None, max_length=6)
    KD_BANK_PERSEPSI: Optional[str] = Field(default=None, max_length=6)
    KD_TP: Optional[str] = Field(default=None, max_length=6)
    NM_WP_SPPT: Optional[str] = Field(default=None, max_length=90)
    JLN_WP_SPPT: Optional[str] = Field(default=None, max_length=90)
    BLOK_KAV_NO_WP_SPPT: Optional[str] = Field(default=None, max_length=45)
    RW_WP_SPPT: Optional[str] = Field(default=None, max_length=6)
    RT_WP_SPPT: Optional[str] = Field(default=None, max_length=9)
    KELURAHAN_WP_SPPT: Optional[str] = Field(default=None, max_length=90)
    KOTA_WP_SPPT: Optional[str] = Field(default=None, max_length=90)
    KD_POS_WP_SPPT: Optional[str] = Field(default=None, max_length=15)
    NPWP_SPPT: Optional[str] = Field(default=None, max_length=45)
    NO_PERSIL_SPPT: Optional[str] = Field(default=None, max_length=15)
    KD_KLS_TANAH: Optional[str] = Field(default=None, max_length=9)
    THN_AWAL_KLS_TANAH: Optional[int] = None
    KD_KLS_BNG: Optional[str] = Field(default=None, max_length=9)
    THN_AWAL_KLS_BNG: Optional[int] = None
    TGL_JATUH_TEMPO_SPPT: Optional[date] = None
    LUAS_BUMI_SPPT: Optional[int] = None
    LUAS_BNG_SPPT: Optional[int] = None
    NJOP_BUMI_SPPT: Optional[int] = None
    NJOP_BNG_SPPT: Optional[int] = None
    NJOP_SPPT: Optional[int] = None
    NJOPTKP_SPPT: Optional[int] = None
    NJKP_SPPT: Optional[int] = None
    PBB_TERHUTANG_SPPT: Optional[int] = None
    FAKTOR_PENGURANG_SPPT: Optional[int] = None
    PBB_YG_HARUS_DIBAYAR_SPPT: Optional[int] = None
    STATUS_PEMBAYARAN_SPPT: Optional[bool] = None
    STATUS_TAGIHAN_SPPT: Optional[bool] = None
    STATUS_CETAK_SPPT: Optional[bool] = None
    TGL_TERBIT_SPPT: Optional[datetime] = None
    TGL_CETAK_SPPT: Optional[datetime] = None
    NIP_PENCETAK_SPPT: Optional[str] = Field(default=None, max_length=60)
