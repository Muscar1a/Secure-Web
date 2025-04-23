from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from crud.users import get_user, create_user
from schemas.user import User, UserCreate
from api.deps import get_db, get_current_user

router = APIRouter(tags=["users"])

@router.post("/register", response_model=User)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user(db, user_in.username):
        raise HTTPException(400, "Username already exists")
    return create_user(db, user_in)

@router.get("/users/me", response_model=User)
def read_me(current_user = Depends(get_current_user)):
    return current_user
