from fastapi import Depends
from app.core.deps import SessionDep, get_token
from app.auth.service import get_current_user as _get_current_user


async def get_current_user(session: SessionDep, token: str = Depends(get_token)):
    """Dependency to get the current authenticated user."""
    return await _get_current_user(session=session, token=token)