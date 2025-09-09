import uuid
import re
from typing import Optional
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
from app.core.database import get_async_session
from app.core.security import create_token, verify_password
from app.models.user import User
from app.core.email import send_reset_password_email
from sqlmodel import select

AUTH_URL_PATH = "auth"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{AUTH_URL_PATH}/login")


class UserService:
    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        result = await session.scalar(statement)
        return result

    @staticmethod
    async def authenticate(session: AsyncSession, email: str, password: str) -> User | None:
        user = await UserService.get_user_by_email(session=session, email=email)
        if not user or not verify_password(password, user.password):
            return None
        return user

    @staticmethod
    async def get_current_user(session: AsyncSession = Depends(get_async_session), token: str = Depends(oauth2_scheme)) -> User:
        from app.core.security import decode_token
        from fastapi import HTTPException

        try:
            payload = decode_token(token, token_type="access")
            user_id = uuid.UUID(payload.get("sub"))
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Inactive user")

        return user

    @staticmethod
    async def validate_password(password: str, email: str) -> list[str]:
        errors = []

        if len(password) < 8:
            errors.append("Password should be at least 8 characters.")
        if email in password:
            errors.append("Password should not contain e-mail.")
        if not any(char.isupper() for char in password):
            errors.append("Password should contain at least one uppercase letter.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password should contain at least one special character.")

        return errors

    @staticmethod
    async def send_reset_password_email(user: User, token: str):
        await send_reset_password_email(user, token)
