from core.security import verify_password
from crud.users import get_user
from typing import Optional

async def authenticate_user(db, username: str, password: str) -> Optional[dict]:
    """
    Verify a user's credentials using MongoDB.
    Returns the user document if valid, otherwise None.
    """
    user = await get_user(db, username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user
