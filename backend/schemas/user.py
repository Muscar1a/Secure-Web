import re
from pydantic import BaseModel, field_validator
from typing import Optional

from schemas.chat import MessageRecipient

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    # password2: str


    @field_validator("password")
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        # must include letters
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        # at least one special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        # at least one uppercase letter
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        # at least one digit
        if not re.search(r"\d", v):
            raise ValueError("Password must include at least one digit")
        return v
    
    
class UserRead(UserBase):
    id: str
    first_name: str | None
    last_name: str | None
    is_active: bool
    is_disabled: bool
User = UserRead
class UserUpdate(BaseModel):
    id: str
    username: Optional[str]   = None
    email: Optional[str]      = None
    first_name: Optional[str] = None
    last_name: Optional[str]  = None
    is_active: Optional[bool] = None
    is_disabled: Optional[bool] = None
    password: Optional[str]   = None

class UserInDb(UserRead):
    private_message_recipients: list[MessageRecipient | None]
    group_chat_ids: list[str | None]


class UserOfAll(User):
    id: str