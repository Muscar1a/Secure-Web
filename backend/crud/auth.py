from sqlalchemy.orm import Session
from crud.users import get_user
from core.security import verify_password

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user