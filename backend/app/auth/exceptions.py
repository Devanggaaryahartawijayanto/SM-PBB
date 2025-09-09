from fastapi import HTTPException, status


def credentials_exception():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def user_already_exists_exception():
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="User with this email already exists",
    )
