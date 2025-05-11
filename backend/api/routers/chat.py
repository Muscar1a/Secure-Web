from fastapi import APIRouter, Depends, HTTPException
from api.deps import (
    get_current_active_user,
    get_private_chat_manager
)
from serializers.chat_serializers import message_serializer
from schemas import shared
from crud.chat import PrivateChatManager
import schemas


router = APIRouter(prefix='/chat', tags=["Chat"])

@router.get('/private/msg-recipients/', response_model=list[schemas.MessageRecipient])
async def get_all_private_message_recipients(
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return await pvt_chat_manager.get_all_msg_recipients(current_user['id'])


@router.get('/private/info/{chat_id}',
            response_model=shared.PrivateChatResponseWithRecipient)
async def get_private_chat(
    chat_id: str,
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    chat = await pvt_chat_manager.get_chat_by_id(chat_id)

    if chat.messages:
        chat.messages = [message_serializer(msg) for msg in chat.messages]

    recipient_profile = await pvt_chat_manager.get_recipient_profile(
        chat.member_ids, current_user['id']
    )

    chat.user_id = current_user['id']
    chat.recipient_profile = recipient_profile

    return chat


@router.get('/private/recipient/chat-id/{recipient_id}',
            response_model=schemas.ChatId)
async def get_recipient_chat_id(
    recipient_id: str,
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        return await pvt_chat_manager.get_recepient(current_user['id'], recipient_id)
    except HTTPException as e:
        raise e
    

@router.get('/private/all/',
            response_model=list[schemas.PrivateChatResponse])
async def get_all_private_chats(
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return await pvt_chat_manager.get_all_chats(current_user['id'])


@router.get('/private/recipient/create-chat/{recipient_id}',
            response_model=schemas.PrivateChat)
async def create_private_chat(
    recipient_id: str,
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        return await pvt_chat_manager.create_chat(current_user['id'], recipient_id)
    except HTTPException as e:
        raise e
    
    

@router.get('/private/messages/{chat_id}',
            response_model=list[schemas.Message])
async def get_private_messages(
    chat_id: str,
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return await pvt_chat_manager.get_chat_messages(chat_id)


