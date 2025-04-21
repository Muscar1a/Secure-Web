import motor.motor_asyncio
from core.config import MONGODB_URL, MONGODB_DB_NAME

_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
mongodb = _client[MONGODB_DB_NAME]
