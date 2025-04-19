from sqlalchemy.orm import Session
from models.user import UserDB
from schemas.user import UserCreate
from core.security import get_password_hash

def get_user(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()

def create_user(db: Session, user_in: UserCreate):
    hashed_pw = get_password_hash(user_in.password)
    db_user = UserDB(username=user_in.username, email=user_in.email, hashed_password=hashed_pw)
    db.add(db_user); db.commit(); db.refresh(db_user)
    return db_user
