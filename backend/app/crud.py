import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import User, UserCreate, UserUpdate, SensorData, SensorDataCreate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, 
        update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}

    # Never store the raw password, always hash it
    if "password" in user_data:
        extra_data["hashed_password"] = get_password_hash(user_data["password"])

    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    query = select(User).where(User.email == email)
    user = session.exec(query).first()
    return user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session=session, email=email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_sensor_data(*, session: Session, sensor_create_data: SensorDataCreate) -> SensorData:
    sensor_data = SensorData.model_validate(sensor_create_data)
    session.add(sensor_data)
    session.commit()
    session.refresh(sensor_data)
    return sensor_data
