import motor.motor_asyncio
from core.config import MONGODB_URL, MONGODB_DB_NAME
import logging

_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
mongodb = _client[MONGODB_DB_NAME]

try:
    _client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)