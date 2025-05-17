from fastapi import APIRouter, Depends, HTTPException, status
from api.deps import (
    get_current_active_user,
    get_private_chat_manager
)
from serializers.chat_serializers import message_serializer
from schemas import shared
from crud.chat import PrivateChatManager
import schemas


router = APIRouter(prefix='/chat', tags=["Chat"])

async def verify_chat_participant(
    chat_id: str,
    current_user=Depends(get_current_active_user),
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
) -> shared.PrivateChatResponseWithRecipient:
    # 1) load the chat
    chat = await pvt_chat_manager.get_chat_by_id(chat_id)
    # 2) membership check
    if current_user.id not in chat["member_ids"]:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat."
        )
    # 3) provide extra data
    chat["user_id"] = current_user.id
    chat["recipient_profile"] = await pvt_chat_manager.get_recipient_profile(
        chat["member_ids"],
        current_user.id
    )
    return shared.PrivateChatResponseWithRecipient(**chat)


@router.get('/private/msg-recipients/', response_model=list[schemas.MessageRecipient])
async def get_all_private_message_recipients(
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return await pvt_chat_manager.get_all_msg_recipients(current_user.id)


@router.get('/private/info/{chat_id}',
            response_model=shared.PrivateChatResponseWithRecipient)
async def get_private_chat(
    chat: shared.PrivateChatResponseWithRecipient = Depends(verify_chat_participant),
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),

):
    if chat.messages:
        chat.messages = [message_serializer(msg) for msg in chat.messages]

    recipient_profile = await pvt_chat_manager.get_recipient_profile(
        chat.member_ids, chat.user_id
    )
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
        return await pvt_chat_manager.get_recepient(current_user.id, recipient_id)
    except HTTPException as e:
        raise e
    

@router.get('/private/all/',
            response_model=list[schemas.PrivateChatResponse])
async def get_all_private_chats(
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    return await pvt_chat_manager.get_all_chats(current_user.id)


@router.get('/private/recipient/create-chat/{recipient_id}',
            response_model=schemas.PrivateChat)
async def create_private_chat(
    recipient_id: str,
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    try:
        return await pvt_chat_manager.create_chat(current_user.id, recipient_id)
    except HTTPException as e:
        raise e
    
    

@router.get('/private/messages/{chat_id}',
            response_model=list[schemas.Message])
async def get_private_messages(
    chat: shared.PrivateChatResponseWithRecipient = Depends(verify_chat_participant),
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
):
    return await pvt_chat_manager.get_chat_messages(chat.chat_id)


