from datetime import date, datetime
import uuid
from typing import Any, List

from app import crud
from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import select
from sqlalchemy import func, sql, and_

from app.api.deps import SessionDependency, CurrentUserDependency
from app.models import (
    OptionList,
    Option,
    SensorData, 
    SensorDataCreate,
    SensorDataPublic, 
    SensorDataListPublic, 
    SensorDataUpdate, 
    SensorDataCsvImportStatus,
    SensorDataLineChartDashboard,
    SensorDataLineChartDashboardItem,
    SensorDataBarChartDashboardItem,
    SensorDataDashboardFetch,
    SensorDataDashboardList,
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
    ).order_by(
        SensorData.equipment_id
    ).offset(skip).limit(limit)
    sensors = session.exec(query).all()

    return SensorDataListPublic(data=sensors, count=count)


@router.get("/options/equipment", response_model=OptionList)
def read_equipment_options(
    session: SessionDependency,
) -> Any:
    """
    Retrieve unique options for all equipment ids present in the database.
    """

    query = select(
        SensorData.equipment_id
    ).select_from(
        SensorData
    ).distinct()
    
    result = session.exec(query).all()

    options: List[Option] = [
        Option(row)
        for row in result
    ]

    return OptionList(data=options)


@router.get("/{id}", response_model=SensorDataPublic)
def read_sensor_data(session: SessionDependency, id: uuid.UUID) -> Any:
    """
    Get sensor data by ID.

    Not to be mistaken for the getByEquipmentId function.
    """
    sensorData = session.get(SensorData, id)
    if not sensorData:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    return sensorData


@router.get("/equipment/{equipment_id}", response_model=SensorDataListPublic)
def read_sensor_data_by_equipment(session: SessionDependency, equipment_id: str) -> Any:
    """
    Get all sensor data emmited by a a specific equipment.
    """

    sensors = crud.get_sensor_data_by_equipment_id(session=session, equipment_id=equipment_id)
    return SensorDataListPublic(data=sensors, count=len(sensors))


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
        {"current_date": datetime.today(), "equipments": []}
    )

    sensors: List[SensorDataLineChartDashboardItem] = [
        SensorDataLineChartDashboardItem(row)
        for row in result.mappings().all()
    ]

    return SensorDataLineChartDashboard(data=sensors)


@router.post("/dashboard/bar-chart", response_model=SensorDataDashboardList)
def read_sensor_data_for_bar_chart(
    session: SessionDependency,
    current_user: CurrentUserDependency,
    fetch_data: SensorDataDashboardFetch) -> Any:
    """
    Get average of values from the specified time period.
    
    Used for the dashboard bar chart and table.
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
        
    count_query = select(
        func.count(SensorData.equipment_id.distinct())
    ).select_from(
        SensorData
    ).where(
        and_(
            SensorData.timestamp > date_interval_begin,
            SensorData.timestamp <= date_interval_end
        )
    )

    count = session.exec(count_query).one()

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
    ).offset(
        fetch_data.skip
    ).limit(
        fetch_data.limit
    )
    
    result = session.exec(query)

    sensors: List[SensorDataBarChartDashboardItem] = [
        SensorDataBarChartDashboardItem(row)
        for row in result.mappings().all()
    ]

    return SensorDataDashboardList(data=sensors, count=count)


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
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
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
