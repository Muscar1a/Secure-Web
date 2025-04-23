from sqlalchemy import Column, Integer, String, Boolean
from db.database import Base
import enum
import uuid

class ChatType(enum.Enum):
    DIRECT = "direct"
    GROUP = "group"


class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
