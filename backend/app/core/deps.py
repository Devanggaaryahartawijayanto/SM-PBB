from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    OAuth2PasswordBearer,
    HTTPBearer,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
from app.core.database import get_async_session

# reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/auth/login")
http_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_async_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


async def get_token(
    oauth_token: str = Depends(oauth2_scheme),
    bearer_creds: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> str:
    if bearer_creds and bearer_creds.scheme.lower() == "bearer":
        return bearer_creds.credentials
    if oauth_token:
        return oauth_token
    raise HTTPException(status_code=401, detail="Not authenticated")
