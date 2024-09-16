import io
import uuid
import pandas as pd
from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import SensorData, SensorDataCreate
from app.tests.utils.utils import random_lower_string, random_float


def test_create_sensor_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    data = {
        "equipment_id": equipment_id, 
        "value": value, 
        "timestamp": timestamp.isoformat()
    }
    r = client.post(
        f"{settings.API_V1_STR}/sensor-data/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300
    created_sensor_data = r.json()
    sensor_data = crud.get_sensor_data_by_id(session=db, id=created_sensor_data["id"])
    assert sensor_data
    assert str(sensor_data.id) == created_sensor_data["id"]
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor_data.id)


def test_get_existing_sensor_data_by_equipment_id(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    r = client.get(
        f"{settings.API_V1_STR}/sensor-data/equipment/{equipment_id}",
        headers=normal_user_token_headers
    )
    assert 200 <= r.status_code < 300
    sensors = r.json()

    assert len(sensors["data"]) > 0
    assert "count" in sensors
    assert sensors["data"][0]["equipment_id"] == equipment_id
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor.id)


def test_get_existing_sensor_data_by_id(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    r = client.get(
        f"{settings.API_V1_STR}/sensor-data/{sensor.id}",
        headers=normal_user_token_headers
    )
    assert 200 <= r.status_code < 300
    sensors = r.json()
    assert sensors["id"] == str(sensor.id)
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor.id)


def test_get_existing_sensor_data_by_id_not_exists(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/sensor-data/{uuid.uuid4()}",
        headers=normal_user_token_headers
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Sensor data not found"


def test_retrieve_sensors_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor_1 = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    equipment_id2 = random_lower_string()
    value2 = random_float()
    sensor_in = SensorDataCreate(equipment_id=equipment_id2, value=value2, timestamp=timestamp)
    sensor_2 = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    r = client.get(f"{settings.API_V1_STR}/sensor-data/", headers=normal_user_token_headers)
    all_sensors = r.json()

    assert len(all_sensors["data"]) > 1
    assert "count" in all_sensors
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor_1.id)
    crud.delete_sensor_data_by_id(session=db, id=sensor_2.id)


def test_sensor_bar_chart_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    data = {
        "skip": 0,
        "limit": 5,
        "fetch_mode": 1
    }

    r = client.post(
        f"{settings.API_V1_STR}/sensor-data/dashboard/bar-chart", 
        headers=normal_user_token_headers,
        json=data
    )
    all_sensors = r.json()

    assert len(all_sensors["data"]) > 1
    assert "count" in all_sensors

    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor.id)


def test_sensor_bar_chart_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()

    d = {'equipment_id': [equipment_id], 'value': [value], "timestamp": [timestamp.isoformat()]}
    df = pd.DataFrame(data=d)

    f = io.BytesIO(b"")
    
    df.to_csv(f, index=False)  

    files = {"uploaded_files": ("sensor_data_csv_file", f, "multipart/form-data")}

    r = client.post(
        f"{settings.API_V1_STR}/sensor-data/csv", 
        headers=normal_user_token_headers,
        json={
            "sensor_data_csv_file": f
        },
        files=files
    )
    all_sensors = r.json()

    # TODO: Couldn't make the request work in the testing. Needs fix


def test_retrieve_equipment_options(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    r = client.get(f"{settings.API_V1_STR}/sensor-data/options/equipment", headers=normal_user_token_headers)
    all_sensors = r.json()

    assert len(all_sensors["data"]) > 1
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensor.id)


def test_update_sensor_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)

    data = {
        "equipment_id": "NEW_ID",
        "value": random_float(),
        "timestamp": datetime.today().isoformat()
    }
    r = client.put(
        f"{settings.API_V1_STR}/sensor-data/{sensor.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_sensor_data = r.json()

    assert updated_sensor_data["equipment_id"] == "NEW_ID"

    sensors = crud.get_sensor_data_by_equipment_id(session=db, equipment_id="NEW_ID")
    assert len(sensors) > 0
    # Cleanup
    crud.delete_sensor_data_by_id(session=db, id=sensors[0].id)


def test_update_sensor_data_not_exists(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {
        "equipment_id": "NEW_ID",
        "value": random_float(),
        "timestamp": datetime.today().isoformat()
    }
    r = client.put(
        f"{settings.API_V1_STR}/sensor-data/{uuid.uuid4()}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Sensor data not found"


def test_delete_sensor_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    equipment_id = random_lower_string()
    value = random_float()
    timestamp = datetime.today()
    sensor_in = SensorDataCreate(equipment_id=equipment_id, value=value, timestamp=timestamp)
    sensor = crud.create_sensor_data(session=db, sensor_create_data=sensor_in)
    
    r = client.delete(
        f"{settings.API_V1_STR}/sensor-data/{sensor.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    deleted_sensor = r.json()
    assert deleted_sensor["message"] == "Sensor data deleted successfully"
    result = db.exec(select(SensorData).where(SensorData.id == sensor.id)).first()
    assert result is None


def test_delete_sensor_data_not_found(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/sensor-data/{uuid.uuid4()}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Sensor data not found"
