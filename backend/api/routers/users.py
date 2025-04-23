from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from schemas.user import User, UserCreate
from crud.users import get_user, create_user
from api.deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    db=Depends(get_db),
) -> Any:
    """
    Register a new user in MongoDB, checking for existing username.
    """
    if await get_user(db, user_in.username):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username already exists")
    created = await create_user(db, user_in)
    return created

@router.get("/me", response_model=User)
async def read_me(
    current_user=Depends(get_current_user)
) -> User:
    """
    Return the currently authenticated user document.
    """
    return current_user
