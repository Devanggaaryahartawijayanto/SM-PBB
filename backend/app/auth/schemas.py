from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, model_validator
from typing import Optional

from app.models.user import UserBase


class RegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    password_confirm: str = Field(min_length=8)
    nama: Optional[str] = None

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("Passwords tidak cocok.")
        errors = []
        if len(self.password) < 8:
            errors.append("minimal 8 karakter")
        if not any(char.isdigit() for char in self.password):
            errors.append("mengandung minimal 1 angka")
        if errors:
            raise ValueError(f"Password harus {', dan '.join(errors)}.")
        return self


class OAuthRegisterRequest(SQLModel):
    email: EmailStr
    password: Optional[str] = None
    nama: Optional[str] = None


class LoginRequest(OAuth2PasswordRequestForm):
    pass


class UserRead(UserBase):
    pass


class TokenResponse(SQLModel):
    access_token: str
    refresh_token: Optional[str] = None


class TokenPayload(SQLModel):
    sub: str | None = None


class ResetPasswordRequest(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class RefreshTokenRequest(SQLModel):
    refresh_token: str


class ProfileVerificationRequest(SQLModel):
    subjek_pajak_id: str
    nop: str
    thn_pajak_sppt: str
    nm_wp_sppt: str
    pbb_yg_harus_dibayar_sppt: str
