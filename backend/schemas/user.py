import re
from pydantic import BaseModel, field_validator

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
        
        return v
    
    
class User(UserBase):
    id: str
    first_name: str | None
    last_name: str | None
    is_active: bool
    is_disabled: bool

class UserUpdate(User):
    password: str | None
    

class UserInDb(User):
    private_message_recipients: list[MessageRecipient | None]
    group_chat_ids: list[str | None]


class UserOfAll(User):
    id: str