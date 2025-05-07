from typing import Optional

from schemas.user import UserCreate
from core.security import get_password_hash
from beanie import PydanticObjectId
from models.user import UserModel
import schemas

async def get_user(db, username: str) -> Optional[dict]:
    """
    Fetch a user document by username.
    """
    return await User.find_one(User.username == username)

async def get_user_by_email(email: str) -> Optional[User]:
    """
    Fetch a User document by email.
    """
    return await User.find_one(User.email == email)


async def create_user(user_in: schemas.UserCreate) -> schemas.User:
    """
    Create a new User document, hashing the password,
    and return the inserted User instance.
    """
    hashed_pw = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        is_active=True,
    )
    await user.insert()   # inserts into Mongo and sets user.id
    return user

async def update_user_password(
    user_id: str,
    new_hashed_password: str
) -> None:
    """
    Update the hashed_password field of the User with given id.
    """
    obj_id = PydanticObjectId(user_id)
    user = await User.get(obj_id)
    if user:
        user.hashed_password = new_hashed_password
        await user.replace()