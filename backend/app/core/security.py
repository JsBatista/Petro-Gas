from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto"
)


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, time_to_expire: timedelta) -> str:
    expire = datetime.now(timezone.utc) + time_to_expire
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(pwd: str, hashed_pwd: str) -> bool:
    return pwd_context.verify(pwd, hashed_pwd)


def get_password_hash(pwd: str) -> str:
    return pwd_context.hash(pwd)
