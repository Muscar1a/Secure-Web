import schemas
from core.security import get_password_hash, verify_password
from serializers import serializers
from models.user import UserModel
from fastapi import status, HTTPException
from schemas import (
    UserInDb, UserCreate, UserUpdate, Login, User,
    MessageRecipient
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from exceptions import UserCreationError
from core.config import settings


class BaseUserManager:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.user_collection = self.db['users']

    async def get_by_id(self, id: str) -> UserInDb:
        user = await self.user_collection.find_one({'id': id})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f'User not found')
        return user

    async def get_by_email(self, email: str) -> UserInDb:
        return await self.user_collection.find_one({'email': email})

    async def get_by_username(self, username: str) -> UserInDb:
        """
        Fetch a user by username, raising 404 if not found.
        """
        user = await self.user_collection.find_one({'username': username})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{username}' not found"
            )
        return user
    

    async def get_all(self) -> list[User]:
        users = await self.user_collection.find({}).to_list(length=None)
        return [serializers.user_serializer(user) for user in users]
    

    async def get_all_except_me(self, current_user_id: str) -> list[schemas.User]:
        all_users = await self.get_all()
        # print(all_users)
        return [user for user in all_users if user.id != current_user_id]

    async def get_public_key(self, user_id: str) -> str:
        user = await self.user_collection.find_one({'id': id})
        return user.get('public_key_pem')

    async def insert_private_message_recipient(
            self,
            user_id: str,
            recipient_model: MessageRecipient
    ):
        result = await self.user_collection.update_one(
            {'id': user_id},
            {'$push': {'private_message_recipients': recipient_model.model_dump()}}
        )
        if result.matched_count == 1 and result.modified_count == 1:
            return True
        

class UserDBManager(BaseUserManager):
    async def authenticate(self, user_data: Login) -> UserInDb:
        user = await self.get_by_username(user_data.username)
        # print('user', user)
        if not user or not verify_password(user_data.password, user.get('password')):
            return None
        return user


class UserCreator(BaseUserManager):
    async def create_user(self, user_data: UserCreate) -> UserInDb:
        """Create a new user with hashed password."""
        existing_user = await self.get_by_username(user_data.username)
        if existing_user:
            raise UserCreationError('Email', 'Email already in use!')

        password_hash = get_password_hash(user_data.password)
        updated_user_data = {
            **user_data.model_dump(),
            'password': password_hash,
            "roles": ["user"],
        }

        new_user = UserModel(**updated_user_data)
        result = await self.user_collection.insert_one(new_user.model_dump())

        if result.acknowledged:
            return await self.get_by_id(new_user.id)

        raise UserCreationError('User creation failed', 'Write not acknowledged')


class UserUpdater(BaseUserManager):
    async def update_user(self, updated_data: UserUpdate) -> UserInDb:
        """Update user data."""
        result = await self.user_collection.update_one(
            {'id': updated_data.id},
            {'$set': updated_data.model_dump()}
        )

        if result.matched_count == 1 and result.modified_count == 1:
            return await self.get_by_id(updated_data.id)
        return None


class UserDeleter(BaseUserManager):
    async def delete_user(self, id: str) -> dict:
        """Delete a user by ID."""
        user = await self.get_by_id(id)
        deleted = await self.user_collection.delete_one({'id': id})

        if deleted.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='User not deleted'
            )

        user.pop('_id', None)
        return user


class User(UserDBManager, UserCreator, UserUpdater, UserDeleter):
    pass