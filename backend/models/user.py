from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from bson import ObjectId

class User(Document):
    username: str = Indexed(str, unique=True)
    email: EmailStr = Indexed(unique=True)
    password: str
    is_active: bool = True

    class Settings:
        name = "users"

    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "johndoe@example.com",
                "password": "hashed_password",
                "is_active": True,
            }
        }
