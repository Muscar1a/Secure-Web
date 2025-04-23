from motor.motor_asyncio import AsyncIOMotorClient
from redis import asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from core.config import MONGODB_URL, MONGODB_DB_NAME


_client = AsyncIOMotorClient(MONGODB_URL)
mongodb = _client[MONGODB_DB_NAME] #! main database name
# mongo_meta = _client[MONGODB_META]  # collection for chat meta data