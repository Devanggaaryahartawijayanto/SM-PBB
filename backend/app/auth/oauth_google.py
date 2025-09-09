# app/auth/oauth_google.py
import secrets
from urllib.parse import urlencode
import httpx
from fastapi import Request, HTTPException
from app.auth.schemas import OAuthRegisterRequest
from app.core.config import settings
from app.core import security
from app.models.user import User
from .service import get_user_by_email, create_user
from sqlmodel.ext.asyncio.session import AsyncSession

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
REDIRECT_URI = settings.FRONTEND_URL + "/auth/oauth/google/callback"

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


def get_google_oauth_url() -> str:
    redirect_uri = f"{settings.BACKEND_URL}/auth/oauth/google/callback"

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def handle_google_callback(request: Request, session: AsyncSession) -> User:
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": f"{settings.BACKEND_URL}/auth/oauth/google/callback",
                "grant_type": "authorization_code",
            },
        )

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="Google auth failed")

        user_resp = await client.get(
            GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )
        google_user = user_resp.json()

    user = await get_user_by_email(session=session, email=google_user["email"])
    if not user:
        register_data = OAuthRegisterRequest(
            email=google_user["email"],
            password=secrets.token_urlsafe(16),
            nama=google_user.get("name", "Google User"),
        )
        user = await create_user(session=session, register=register_data)

    return user
