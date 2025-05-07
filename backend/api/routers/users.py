from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
import schemas
from crud.user import User
from backend.crud.user import get_user, create_user
from api.deps import (
    get_current_user, 
    get_user_manager
)


router = APIRouter(prefix="/users", tags=["users"], response_model=schemas.User)

@router.post("/register", response_model=User)
async def register(
    user_in: schemas.UserCreate,
    user_manager: User = Depends(get_user_manager),
):
    """
    Register a new user in MongoDB, checking for existing username.
    
    
    if await get_user(user_in.username):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username already exists")
    created = await create_user(user_in)
    return created
    """
    try:
        new_user = await user_manager.create_user(user_in)
        # TODO: from here
        
        
@router.get("/me", response_model=User)
async def read_me(
    current_user=Depends(get_current_user)
) -> User:
    """
    Return the currently authenticated user document.
    """
    return current_user
