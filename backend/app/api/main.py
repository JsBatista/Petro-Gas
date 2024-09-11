from fastapi import APIRouter

from app.api.routes import sensor_data, auth, users, utils

# Sets up all routers, one for each endpoint prefix for our application
# DO NOT write the routes manually in this file
api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(sensor_data.router, prefix="/sensor-data", tags=["sensor-data"])
