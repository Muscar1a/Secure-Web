from core.security import verify_password
from backend.crud.user import get_user
from models.user import User
from typing import Optional

async def authenticate_user(
    username: str,
    password: str,
) -> Optional[User]:
    """
    Verify username & password.
    Returns the User if credentials match, otherwise None.
    """
    user = await get_user(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user