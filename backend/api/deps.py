from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from crud.user import User, get_user
from db.mongo import get_db
from schemas.token import TokenData
from core.config import settings
from models.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase
import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Decode the JWT, fetch the User document via Beanie,
    and return it (minus sensitive fields).
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = await get_user(token_data.username)
    if not user:
        raise credentials_exception

    # strip out sensitive bits
    user_dict = user.dict()
    user_dict.pop("hashed_password", None)
    return User(**user_dict)


# Dependency to create a User instance
async def get_user_manager(db: AsyncIOMotorDatabase = Depends(get_db)):
    return User(db)