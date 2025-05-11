from motor.motor_asyncio import AsyncIOMotorClient

import logging

from core.config import settings

logger = logging.getLogger(__name__)

MONGODB_URL = settings.MONGODB_URL

_client = AsyncIOMotorClient(MONGODB_URL)
mongodb = _client[settings.MONGODB_DB_NAME]

async def get_db():
    return mongodb


async def ping_mongodb():
    try:
        await _client.admin.command('ping')
        print("Connection status: You have successfully connected to MongoDB!")
    except Exception as e:
        print(e)
        
        
async def db_connection_status():
    await ping_mongodb()



async def startup_db_client(app):
    app.mongodb_client = _client
    app.mongodb = mongodb
    

async def shutdown_db_client(app):
    app.mongodb_client.close()


async def db_connection_status():
    await ping_mongodb()