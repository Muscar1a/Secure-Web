from typing import Optional
from schemas.user import UserCreate
from core.security import get_password_hash

async def get_user(db, username: str) -> Optional[dict]:
    """
    Fetch a user document by username.
    """
    return await db.users.find_one({"username": username})

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
