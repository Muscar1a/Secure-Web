import logging
from datetime import datetime
from uuid import UUID
from motor.motor_asyncio import AsyncIOMotorDatabase

from schemas.chat import GetDirectChatSchema, GetMessageSchema

from models import UserDB
from db.database import mongo_client

async def get_users_collection() -> AsyncIOMotorDatabase:
    # Get users collection in chatapp database
    return mongo_client['users']
    

async def get_chat_metadata_collection() -> AsyncIOMotorDatabase:
    return mongo_client['chat_metadata']
    
    
    
async def get_user_by_guid(user_guid: UUID) -> UserDB | None:
    user_collection = await get_users_collection()
    user = await user_collection.find_one({'_id': str(user_guid)})
    if user:
        return UserDB(**user)
    return None


async def direct_chat_exist(initiator_user_id: str, recipient_user_guid: str) -> bool:
    # Check if a direct chat exists between two users
    pass
    """
    metadata_chat_collection = await get_chat_db(initiator_user_id, mongo_client)
    chat = await chat_collection.find_one({'recipient_user_guid': recipient_user_guid})
    return chat is not None
    """