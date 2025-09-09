from datetime import datetime, timedelta, timezone
from typing import Any
import uuid

import bcrypt
from fastapi import HTTPException
import jwt

from app.core.config import settings


ALGORITHM = "HS256"

# In-memory JTI blacklist (for demo). Use Redis or DB in production.
revoked_refresh_tokens: set[str] = set()


def create_token(subject: str, token_type: str = "access") -> str:
    now = datetime.now(timezone.utc)
    expire = now + (
        settings.ACCESS_TOKEN_EXPIRE
        if token_type == "access"
        else settings.REFRESH_TOKEN_EXPIRE
    )
    secret_key = (
        settings.ACCESS_SECRET_KEY
        if token_type == "access"
        else settings.REFRESH_SECRET_KEY
    )
    to_encode = {
        "sub": subject,
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "token_type": token_type,
        "iss": "app",
        "aud": "app-api",
    }
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)


def decode_token(token: str, token_type: str = "access") -> dict[str, Any]:
    secret_key = (
        settings.ACCESS_SECRET_KEY
        if token_type == "access"
        else settings.REFRESH_SECRET_KEY
    )

    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[ALGORITHM],
            issuer="app",
            audience="app-api",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, detail=f"{token_type.capitalize()} token expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"JWT decode failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid {token_type} token")

    # Validate token type in payload
    if payload.get("token_type") != token_type:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token type. Expected {token_type}, got {payload.get('token_type')}",
        )

    return payload


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
