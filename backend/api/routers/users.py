from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from services.token import TokenManager
from exceptions.user import UserCreationError
import schemas
from crud.user import User
from api.deps import (
    get_current_active_user,
    get_current_user,
    get_token_manager, 
    get_user_manager
)


router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.User)
async def register(
    user_in: schemas.UserCreate,
    user_manager: User = Depends(get_user_manager),
):
    try:
        new_user = await user_manager.create_user(user_in)
        return new_user
    except UserCreationError as e:
        print(e)
        print(e.field, e.message)
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                'error': 'Validation Field',
                'errors': [
                    {
                        'field': e.field,
                        'message': e.message
                    }
                ]
            }
        )


        
        
@router.get("/me", response_model=schemas.User)
async def read_me(
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    user = await user_manager.get_by_id(current_user['id'])
    return user


@router.get('/info/{user_id}', status_code=status.HTTP_200_OK, response_model=schemas.User)
async def get_user_detail(
    user_id: str,
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    user = await user_manager.get_by_id(user_id)
    return user


@router.get('/all', status_code=status.HTTP_200_OK, response_model=list[schemas.UserOfAll])
async def get_all_user(
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    users = await user_manager.get_all_except_me(current_user['id'])
    return users


@router.put('/update/info/{user_id}', status_code=status.HTTP_200_OK, response_model=schemas.User)
async def update_user(
    user_id: str,
    updated_data: schemas.UserUpdate,
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    user = await user_manager.update_user(user_id, updated_data)
    return user

@router.delete('/delete/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    user_manager: User = Depends(get_user_manager),
    current_user: schemas.User = Depends(get_current_active_user)
):
    deleted_user = await user_manager.delete_user(user_id)
    return deleted_user