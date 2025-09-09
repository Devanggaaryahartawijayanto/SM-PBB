from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime


class Spop(SQLModel, table=True):
    __tablename__ = "spop"

    KD_PROPINSI: str = Field(primary_key=True, max_length=6)
    KD_DATI2: str = Field(primary_key=True, max_length=6)
    KD_KECAMATAN: str = Field(primary_key=True, max_length=9)
    KD_KELURAHAN: str = Field(primary_key=True, max_length=9)
    KD_BLOK: str = Field(primary_key=True, max_length=9)
    NO_URUT: str = Field(primary_key=True, max_length=12)
    KD_JNS_OP: str = Field(primary_key=True, max_length=3)
    SUBJEK_PAJAK_ID: Optional[str] = Field(default=None, max_length=90)
    NO_FORMULIR_SPOP: Optional[str] = Field(default=None, max_length=33)
    JNS_TRANSAKSI_OP: Optional[str] = Field(default=None, max_length=3)
    KD_PROPINSI_BERSAMA: Optional[str] = Field(default=None, max_length=6)
    KD_DATI2_BERSAMA: Optional[str] = Field(default=None, max_length=6)
    KD_KECAMATAN_BERSAMA: Optional[str] = Field(default=None, max_length=9)
    KD_KELURAHAN_BERSAMA: Optional[str] = Field(default=None, max_length=9)
    KD_BLOK_BERSAMA: Optional[str] = Field(default=None, max_length=9)
    NO_URUT_BERSAMA: Optional[str] = Field(default=None, max_length=12)
    KD_JNS_OP_BERSAMA: Optional[str] = Field(default=None, max_length=3)
    KD_PROPINSI_ASAL: Optional[str] = Field(default=None, max_length=6)
    KD_DATI2_ASAL: Optional[str] = Field(default=None, max_length=6)
    KD_KECAMATAN_ASAL: Optional[str] = Field(default=None, max_length=9)
    KD_KELURAHAN_ASAL: Optional[str] = Field(default=None, max_length=9)
    KD_BLOK_ASAL: Optional[str] = Field(default=None, max_length=9)
    NO_URUT_ASAL: Optional[str] = Field(default=None, max_length=12)
    KD_JNS_OP_ASAL: Optional[str] = Field(default=None, max_length=3)
    NO_SPPT_LAMA: Optional[str] = Field(default=None, max_length=54)
    JALAN_OP: Optional[str] = Field(default=None, max_length=90)
    BLOK_KAV_NO_OP: Optional[str] = Field(default=None, max_length=45)
    KELURAHAN_OP: Optional[str] = Field(default=None, max_length=90)
    RW_OP: Optional[str] = Field(default=None, max_length=6)
    RT_OP: Optional[str] = Field(default=None, max_length=9)
    KD_STATUS_WP: Optional[str] = Field(default=None, max_length=3)
    LUAS_BUMI: Optional[int] = None
    KD_ZNT: Optional[str] = Field(default=None, max_length=6)
    JNS_BUMI: Optional[str] = Field(default=None, max_length=3)
    NILAI_SISTEM_BUMI: Optional[int] = None
    TGL_PENDATAAN_OP: Optional[date] = None
    NM_PENDATAAN_OP: Optional[str] = Field(default=None, max_length=90)
    NIP_PENDATA: Optional[str] = Field(default=None, max_length=60)
    TGL_PEMERIKSAAN_OP: Optional[date] = None
    NM_PEMERIKSAAN_OP: Optional[str] = Field(default=None, max_length=90)
    NIP_PEMERIKSA_OP: Optional[str] = Field(default=None, max_length=60)
    NO_PERSIL: Optional[str] = Field(default=None, max_length=15)
