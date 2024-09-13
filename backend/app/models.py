from datetime import datetime
from enum import Enum
from typing import Any, Optional
import math
import uuid

from pydantic import EmailStr, model_validator
from sqlmodel import Field, SQLModel


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
    pass

# Properties to receive on sensor data creation
class SensorDataCreateCsv(SensorDataBase):
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

    # Stop NaN values from being added to the object
    @model_validator(mode='before')
    @classmethod
    def check_value_for_nan(cls, data: Any) -> Any:
        if isinstance(data, dict):
            assert (
                not math.isnan(data['value'])
            ), 'Value cannot be NaN'
        return data


# Properties to return via API, id is always required
class SensorDataPublic(SensorDataBase):
    id: uuid.UUID


class SensorDataListPublic(SQLModel):
    data: list[SensorDataPublic]
    count: int


class SensorDataCsvImportStatus(SQLModel):
    count_success: int
    count_fail: int

    def __init__(self, count_success, count_fail):
        self.count_success = count_success
        self.count_fail = count_fail


class SensorDataFetchMode(Enum):
    LAST_24H = 1
    LAST_48H = 2
    LAST_WEEK = 3
    LAST_MONTH = 4


# Properties to receive on dashboard queries
class SensorDataDashboardFetch(SQLModel):
    fetch_mode: SensorDataFetchMode
    equipment_ids: Optional[list[str]] = Field(None, description="The list of equipments id to filter.")


# Properties to receive on dashboard queries
class SensorDataLineChartDashboardItem(SQLModel):
    equipment_id: str
    date_trunc: datetime
    avg: float

    def __init__(self, row):
        self.equipment_id=row['equipment'],
        self.date_trunc=row['date_trunc'],
        self.avg=row['avg']


# Properties to receive on dashboard queries
class SensorDataLineChartDashboard(SQLModel):
    data: list[SensorDataLineChartDashboardItem]


class SensorDataBarChartDashboardItem(SQLModel):
    equipment_id: str
    avg: float

    def __init__(self, row):
        self.equipment_id=row['equipment_id']
        self.avg=row['avg']


# Properties to receive on dashboard queries
class SensorDataBarChartDashboard(SQLModel):
    data: list[SensorDataBarChartDashboardItem]


class Option(SQLModel):
    value: str
    label: str
    
    def __init__(self, value, label = None):
        self.value = value
        self.label = value if label is None else label 


class OptionList(SQLModel):
    data: list[Option]
