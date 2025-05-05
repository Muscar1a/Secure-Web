from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from api.deps import get_db

from models.message import (
    MessageModel,
    AddMessageModel,
    GetMessageModel,
    Message,
    TagModel,
)


router = APIRouter()


@router.post("/addmsg")
async def add_message(
    reqbody: AddMessageModel,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Add a message to the database.
    """
    try:
        new_message = MessageModel(
            message=Message(text=reqbody.message),
            users=[reqbody.sender, reqbody.receiver],
            sender=ObjectId(reqbody.sender),
            createdAt=datetime.now(),
            tag="",
        )
        # new_message = await new_message.create()
        result = await db["messages"].insert_one(new_message)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
    
@router.post("/getmsg")
async def get_message(
    reqbody: GetMessageModel,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get messages between two users.
    """
    try:
        query = {"users": {"$all": [reqbody.sender, reqbody.receiver]}}
        messages = await db.messages.find(query, sort=[("createdAt", 1)]).to_list()

        projected_messages = [
            {
                "fromSelf": msg.sender == ObjectId(reqbody.sender),
                "message": msg.message.text,
                "message_id": str(msg.id),
                "tag": msg.tag,
            }
            for msg in messages
        ]

        return projected_messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error {e}")
    
    

@router.post("/react")
async def react(
    reqbody: TagModel,    
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Add a tag to the message.
    """
    try:
        message_id = ObjectId(reqbody.message_id)
        message = await db.messages.find_one({"_id": message_id})

        if message:
            message.tag = reqbody.tag
            await message.save()

            return {"msg": "Reacted to successfully."}
        else:
            raise HTTPException(status_code=404, detail="Message not found.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error {e}")


async def tag_message(*args, **kwargs):
    await react(TagModel(message_id=kwargs["message_id"], tag=kwargs["tag"]))