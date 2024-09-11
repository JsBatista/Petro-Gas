from datetime import datetime
import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# Shared properties 
class SensorDataBase(SQLModel):
    equipment_id: str = Field(min_length=1, max_length=255)
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)


# Properties to receive on sensor data creation
class SensorDataCreate(SensorDataBase):
    def __init__(self, df_row):
        self.equipment_id = df_row[0]
        self.timestamp = df_row[1]
        self.value = df_row[2]


# Properties to receive on sensor data update
class SensorDataUpdate(SensorDataBase):
    pass


# Database model, database table inferred from class name
class SensorData(SensorDataBase, table=True):
    __tablename__ = "sensor_data"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    equipment_id: str = Field(min_length=1, max_length=255)
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)


# Properties to return via API, id is always required
class SensorDataPublic(SensorDataBase):
    id: uuid.UUID


class SensorDataListPublic(SQLModel):
    data: list[SensorDataPublic]
    count: int