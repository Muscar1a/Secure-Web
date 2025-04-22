import re
from pydantic import BaseModel, validator

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str


    @validator("password")
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        # at least one special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        # at least one uppercase letter
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        return v
    
class User(UserBase):
    id: str
    is_active: bool
    class Config:
        orm_mode = True

