import motor.motor_asyncio
from core.config import MONGODB_URL, MONGODB_DB_NAME
import logging

_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
mongodb = _client[MONGODB_DB_NAME]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Connected to MongoDB database: {MONGODB_DB_NAME}")