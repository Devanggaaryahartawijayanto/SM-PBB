from uuid import UUID
from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.core import security
from app.core.database import get_async_session
from app.core.deps import SessionDep, get_token
from .schemas import RegisterRequest, TokenPayload
from .exceptions import user_already_exists_exception, credentials_exception
from app.models.user import User


async def get_user_by_email(*, session: AsyncSession, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    db_user = await session.scalar(statement)
    return db_user


async def get_user(
    session: SessionDep,
    token: str,
    require_active: bool = True,
) -> User:
    payload = security.decode_token(token, token_type="access")
    token_data = TokenPayload(**payload)

    try:
        user_id = UUID(token_data.sub)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"code": "USER_INVALID_ID", "msg": "Invalid user ID"},
        )

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "USER_NOT_FOUND", "msg": "User not found"},
        )

    if require_active and not user.is_active:
        raise HTTPException(
            status_code=400,
            detail={"code": "USER_INACTIVE", "msg": "Inactive user"},
        )

    return user


async def get_current_user(
    session: SessionDep,
    token: str = Depends(get_token),
) -> User:
    return await get_user(session=session, token=token, require_active=True)


async def get_current_user_allow_inactive(
    session: SessionDep,
    token: str = Depends(get_token),
) -> User:
    return await get_user(session=session, token=token, require_active=False)


async def create_user(*, session: AsyncSession, register: RegisterRequest) -> User:
    if await get_user_by_email(session=session, email=register.email):
        raise user_already_exists_exception()

    db_user = User.model_validate(
        register, update={"password": security.hash_password(register.password)}
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def authenticate(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user or not security.verify_password(password, db_user.password):
        raise credentials_exception()
    return db_user
