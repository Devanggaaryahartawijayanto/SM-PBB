from typing import Annotated
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession

from app.auth.oauth_google import get_google_oauth_url, handle_google_callback
from app.core import security
from app.core.config import settings
from app.core.deps import SessionDep
from app.core.database import get_async_session
from app.models.base import APIMessage
from app.models.user import User
from app.users import UserService
from .schemas import UserRead, RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserRead)
async def register(register_data: RegisterRequest, session: AsyncSession = Depends(get_async_session)):
    # Validate password
    errors = await UserService.validate_password(register_data.password, register_data.email)
    if errors:
        raise HTTPException(status_code=400, detail={"password": errors})

    # Check if user exists
    existing_user = await UserService.get_user_by_email(session=session, email=register_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=register_data.email,
        password=security.hash_password(register_data.password),
        is_active=True
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(session: SessionDep, login_data: Annotated[LoginRequest, Depends()]) -> TokenResponse:
    user = await UserService.authenticate(session=session, email=login_data.username, password=login_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return TokenResponse(
        access_token=security.create_token(subject=str(user.id), token_type="access"),
        refresh_token=security.create_token(subject=str(user.id), token_type="refresh"),
    )


@router.get("/oauth/google/redirect")
async def google_redirect():
    return RedirectResponse(url=get_google_oauth_url())


@router.get("/oauth/google/callback")
async def google_callback(request: Request, session: SessionDep):
    user = await handle_google_callback(request, session)

    access_token = security.create_token(subject=str(user.id), token_type="access")
    refresh_token = security.create_token(subject=str(user.id), token_type="refresh")

    params = urlencode({"access_token": access_token, "refresh_token": refresh_token})

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/oauth/google/callback?{params}"
    )


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(UserService.get_current_user)):
    return current_user


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, session: SessionDep):
    payload = security.decode_token(data.refresh_token, token_type="refresh")
    jti = payload.get("jti")
    user_id = payload.get("sub")

    if not jti or not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    if jti in security.revoked_refresh_tokens:
        raise HTTPException(status_code=401, detail="Refresh token has been revoked")

    security.revoked_refresh_tokens.add(jti)

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or non-existent user")

    return TokenResponse(
        access_token=security.create_token(subject=str(user.id), token_type="access"),
        refresh_token=security.create_token(subject=str(user.id), token_type="refresh"),
    )


@router.post("/verification")
async def verification(email: str, session: SessionDep):
    user = await UserService.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Here you would typically send a verification email
    # For simplicity, we just return a success message
    return APIMessage(message="Verification email sent (simulated)")


@router.post("/logout", response_model=APIMessage)
async def logout():
    # If using stateless JWT: client deletes token
    # If using blacklist or DB token store: invalidate it here
    return APIMessage(message="Logged out successfully")
