import uuid
import pandas as pd
from io import StringIO
from typing import Any

from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import func, select

from app.api.deps import CurrentUserDependency, SessionDependency
from app.models import SensorData, SensorDataCreate, SensorDataPublic, SensorDataListPublic, SensorDataUpdate, Message

router = APIRouter()


@router.get("/", response_model=SensorDataListPublic)
def read_sensors_data(
    session: SessionDependency, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all sensors data.
    """

    count_query = select(func.count()).select_from(SensorData)
    count = session.exec(count_query).one()

    query = select(SensorData).offset(skip).limit(limit)
    items = session.exec(query).all()

    return SensorDataListPublic(data=items, count=count)


@router.get("/{id}", response_model=SensorDataPublic)
def read_sensor_data(session: SessionDependency, id: uuid.UUID) -> Any:
    """
    Get sensor data by ID.

    Not to be mistaken for the getByEquipmentId function.
    """
    item = session.get(SensorData, id)
    if not item:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    return item


@router.post("/", response_model=SensorDataPublic)
def create_sensor_data(
    *, session: SessionDependency, sensor_data_create: SensorDataCreate
) -> Any:
    """
    Creates a new registry of a Sensor data.
    """
    sensor_data = SensorData.model_validate(
        sensor_data_create
    )

    session.add(sensor_data)
    session.commit()
    session.refresh(sensor_data)
    return sensor_data


@router.post("/csv")
async def create_sensor_data_from_csv(
    *, 
    session: SessionDependency, 
    sensor_data_csv_file: UploadFile = File(...)
) -> Any:
    """
    Creates registries of all sensors data present in the csv file.

    TODO: Add validation
    """
    contents = sensor_data_csv_file.file.read()
    data = StringIO(str(contents,'utf-8')) 
    df = pd.read_csv(data)

    sensor_data_create_list = df.to_dict('records')

    sensor_data_create_list = list(map(lambda x: {
        "equipment_id": x['equipmentId'],
        "value": x['value'],
        "timestamp": x['timestamp']
    }, sensor_data_create_list))
    
    print(sensor_data_create_list)

    session.bulk_insert_mappings(SensorData, sensor_data_create_list)
    session.commit()

    data.close()


@router.put("/{id}", response_model=SensorDataPublic)
def update_sensor_data(
    *,
    session: SessionDependency,
    id: uuid.UUID,
    sensor_data_update: SensorDataUpdate,
) -> Any:
    """
    Update a sensor data registry.

    Usually, this endpoint should not be called. Invalid registries must not be registered,
    and further updates must be created normally.
    """
    sensor_data = session.get(SensorData, id)
    if not sensor_data:
        raise HTTPException(status_code=404, detail="Sensor data not found")

    update_dict = sensor_data_update.model_dump(exclude_unset=True)
    sensor_data.sqlmodel_update(update_dict)
    session.add(sensor_data)
    session.commit()
    session.refresh(sensor_data)
    return sensor_data


@router.delete("/{id}")
def delete_sensor_data(
    session: SessionDependency, 
    id: uuid.UUID
) -> Message:
    """
    Delete a sensor data registry.

    Usually, this endpoint should not be called. Invalid registries must not be registered,
    and further updates must be created normally.
    """
    sensor_data = session.get(SensorData, id)
    if not sensor_data:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    session.delete(sensor_data)
    session.commit()
    return Message(message="Sensor data deleted successfully")
