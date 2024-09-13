from datetime import date, datetime
import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import select
from sqlalchemy import func, sql, and_

from app.api.deps import SessionDependency, CurrentUserDependency
from app.models import (
    SensorData, 
    SensorDataCreate,
    SensorDataPublic, 
    SensorDataListPublic, 
    SensorDataUpdate, 
    SensorDataCsvImportStatus,
    SensorDataLineChartDashboard,
    SensorDataLineChartDashboardItem,
    SensorDataBarChartDashboard,
    SensorDataBarChartDashboardItem,
    SensorDataDashboardFetch,
    Message
)
from app.utils import read_csv_sensor_data_file, get_data_interval

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

    query = select(
        SensorData
    ).order_by(
        SensorData.timestamp.desc()
    ).offset(skip).limit(limit)
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


@router.get("/equipment/{equipment_id}", response_model=SensorDataListPublic)
def read_sensor_data_by_equipment(session: SessionDependency, equipment_id: str) -> Any:
    """
    Get all sensor data emmited by a a specific equipment.
    """

    query = select(SensorData).where(SensorData.equipment_id == equipment_id)
    items = session.exec(query).all()

    return SensorDataListPublic(data=items, count=len(items))


@router.post("/dashboard/line-chart", response_model=SensorDataLineChartDashboard)
def read_sensor_data_for_line_chart(
    session: SessionDependency,
    current_user: CurrentUserDependency) -> Any:
    """
    Get values from hour to hour from the last day. 
    
    Not required, but can be used to create line graphs to show the average values over time for an equipment.
    """
    if(not current_user):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    result = session.execute(
        sql.text('SELECT * FROM avg_last_24(:current_date, :equipments);'), 
        {"current_date": datetime(2023, 2, 14, 2, 30), "equipments": []}
    )

    items: List[SensorDataLineChartDashboardItem] = [
        SensorDataLineChartDashboardItem(row)
        for row in result.mappings().all()
    ]

    return SensorDataLineChartDashboard(data=items)


@router.post("/dashboard/bar-chart", response_model=SensorDataBarChartDashboard)
def read_sensor_data_for_bar_chart(
    session: SessionDependency,
    current_user: CurrentUserDependency,
    fetch_data: SensorDataDashboardFetch) -> Any:
    """
    Get values from hour to hour from the last day. 
    
    Not required, but can be used to create line graphs to show the average values over time for an equipment.
    """
    if(not current_user):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        (date_interval_begin, date_interval_end) = get_data_interval(fetch_data)
    except ValueError as e: 
        raise HTTPException(status_code=400, detail= " ".join(e.args))

    query = select(
        SensorData.equipment_id, 
        func.avg(SensorData.value).label("avg")
    ).select_from(
        SensorData
    ).where(
        and_(
            SensorData.timestamp > date_interval_begin,
            SensorData.timestamp <= date_interval_end
        )
    )

    if(fetch_data.equipment_ids is not None and len(fetch_data.equipment_ids)>0):
        query = query.where(
            SensorData.equipment_id.in_(fetch_data.equipment_ids)
        )

    query = query.group_by(
        SensorData.equipment_id
    ).order_by(
        SensorData.equipment_id
    )
    
    result = session.exec(query)

    items: List[SensorDataBarChartDashboardItem] = [
        SensorDataBarChartDashboardItem(row)
        for row in result.mappings().all()
    ]

    return SensorDataBarChartDashboard(data=items)


@router.post("/", response_model=SensorDataPublic)
def create_sensor_data(
    *, 
    session: SessionDependency, 
    sensor_data_create: SensorDataCreate,
    current_user: CurrentUserDependency
) -> Any:
    """
    Creates a new registry of a Sensor data.
    """
    if(not current_user):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    sensor_data = SensorData.model_validate(
        sensor_data_create
    )

    session.add(sensor_data)
    session.commit()
    session.refresh(sensor_data)
    return sensor_data


@router.post("/csv", response_model=SensorDataCsvImportStatus)
async def create_sensor_data_from_csv(
    *, 
    session: SessionDependency, 
    sensor_data_csv_file: UploadFile = File(...),
    current_user: CurrentUserDependency
) -> Any:
    """
    Creates registries of all sensors data present in the csv file.
    """
    if(not current_user):
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        sensor_data_create_list = await read_csv_sensor_data_file(sensor_data_csv_file)
    except ValueError as e: 
        raise HTTPException(status_code=400, detail= " ".join(e.args))

    error_data_list = []

    def validate_sensor_data_or_null(data):
        try:
            return SensorData.model_validate(data)
        except Exception:
            error_data_list.append(data)
            return None

    sensor_data_create_list = list(
        filter(
            lambda x: x != None,
            map(validate_sensor_data_or_null, sensor_data_create_list)
        )
    )

    session.bulk_insert_mappings(SensorData, sensor_data_create_list)
    session.commit()
    
    return SensorDataCsvImportStatus(
        count_success=len(sensor_data_create_list),
        count_fail = len(error_data_list)
    )


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
