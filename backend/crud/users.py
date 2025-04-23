from typing import Optional
from schemas.user import UserCreate
from core.security import get_password_hash
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_user(db, username: str) -> Optional[dict]:
    """
    Fetch a user document by username.
    """
    return await db.users.find_one({"username": username})

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    return await db.users.find_one({"email": email})

async def create_user(db, user_in: UserCreate) -> dict:
    """
    Create a new user document with hashed password and return it,
    converting the MongoDB ObjectId to a string 'id' field.
    """
    hashed_pw = get_password_hash(user_in.password)
    doc = {
        "username": user_in.username,
        "email": user_in.email,
        "hashed_password": hashed_pw,
        "is_active": True,
    }
    result = await db.users.insert_one(doc)
    user_doc = await db.users.find_one({"_id": result.inserted_id})
    # expose a string id instead of ObjectId
    user_doc["id"] = str(user_doc["_id"])
    return user_doc

async def update_user_password(
    db: AsyncIOMotorDatabase,
    user_id: str,
    new_hashed_password: str
) -> None:
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": new_hashed_password}}
    )