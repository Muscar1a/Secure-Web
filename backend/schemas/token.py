from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


class Login(BaseModel):
    email: EmailStr
    username: str
    password: str
    


class TokenPayload(BaseModel):
    sub: str | None = None