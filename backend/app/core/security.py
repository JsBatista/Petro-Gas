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


def verify_password(password: str, hashed_password: str) -> bool:
    print('INSIDE VERIFY PASSWORD')
    print(settings.SECRET_KEY)
    print(password)
    return pwd_context.verify(password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
