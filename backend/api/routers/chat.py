import json

from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.deps import get_current_user
from api.routers.chat_service import get_user_by_guid, direct_chat_exist
from models import UserDB
from db.database import mongo_client, mongo_meta, _client
from motor.motor_asyncio import AsyncIOMotorDatabase

from schemas.chat import (
    CreateDirectChatSchema,
    DisplayDirectChatSchema,
    GetDirectChatSchema,
    GetDirectChatsSchema,
    GetMessagesSchema,
    GetOldMessagesSchema,
)


chat_router = APIRouter(tags=['Chat Management'])

async def get_chat_db(chat_guid: str, client):
    # Get specific chat database
    db_name = chat_guid
    return client[db_name]

@chat_router.post("/chat/direct/", summary="Create a direct chat", response_model=DisplayDirectChatSchema)
async def create_direct_chat_view(
    create_direct_chat_schema: CreateDirectChatSchema,
    current_user: UserDB = Depends(get_current_user),
):
    recipient_user_guid = create_direct_chat_schema.recipient_user_guid
    recipient_user = await UserDB | None = await get_user_by_guid(user_guid=recipient_user_guid)
    
    if not recipient_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"There is no recipient user with provided guid [{recipient_user_guid}]",
        )
        
    if await direct_chat_exist(str(current_user._id), recipient_user['_id']):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Chat with recipient user exists [{recipient_user_guid}]"
        )