from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
import logging
import os

from core.config import settings
from models.user import User 
from models.message import Message

logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URI", settings.MONGODB_URL)

_client = AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URL)
mongodb = AsyncIOMotorDatabase = _client[settings.MONGODB_DB_NAME]

async def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency: yields the DB handle to any route that depends on it.
    """
    yield mongodb


async def startup_db_client():
    """
    Startup handler:
      1. Initialize Beanie with all your Document models.
      2. Ping MongoDB to verify connectivity.
    """
    #Wire up Beanie
    await init_beanie(
        database=mongodb,
        document_models=[User, Message],
    )
    logger.info("Beanie initialized with models: %s", ["User", "Message"])

    #Ping
    try:
        await _client.admin.command("ping")
        logger.info(f"MongoDB connected at {MONGODB_URL}")
    except Exception:
        logger.exception("MongoDB connection failed on startup.")

async def shutdown_db_client():
    """ Shutdown handler: closes the client pool. """
    _client.close()
    logger.info("MongoDB connection closed.")