import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session
from collections.abc import Generator
from typing import Annotated

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.models import TokenPayload, User

# This file sets up all dependencies for the backend.

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDependency = Annotated[Session, Depends(get_db)]
TokenDependency = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDependency, token: TokenDependency) -> User:
    try:
        token_payload = TokenPayload(**jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[security.ALGORITHM]
        ))
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User could not be authenticaded",
        )

    user = session.get(User, token_payload.sub)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="User not active"
        )
    return user


CurrentUserDependency = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(user: CurrentUserDependency) -> User:
    if user.is_superuser:
        return user 
    else:
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized user"
        )
