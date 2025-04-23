from pydantic import BaseModel, UUID4

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    is_active: bool
    class Config:
        orm_mode = True
        from_attributes = True
