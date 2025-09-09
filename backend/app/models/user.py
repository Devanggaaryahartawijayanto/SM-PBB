import datetime
import uuid
from pydantic import EmailStr
from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    nama: str | None = Field(default=None, max_length=255)
    telepon: str = Field(default="")
    alamat: str = Field(default="")
    is_active: bool = False
    is_verified: bool = False


class User(UserBase, table=True):
    __tablename__ = "ipbb_user"
    password: str = Field(min_length=8)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
