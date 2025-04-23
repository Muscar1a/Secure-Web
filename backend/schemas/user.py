from pydantic import BaseModel, Field

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    class Config:
        orm_mode = True

