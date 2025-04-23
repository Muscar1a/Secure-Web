"""
Chat model
"""
from sqlalchemy import Column, Integer, String, Boolean
from db.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

import enum


class ChatType(enum.Enum):
    DIRECT = "direct"
    GROUP = "group"
    

class ChatDB(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    chat_guid = Column(String, unique=True, index=True)
    chat_type = Column(String, default=ChatType.DIRECT.value)  # Use enum value for storage
    chat_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)