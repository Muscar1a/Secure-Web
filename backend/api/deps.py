from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
#from db.session import SessionLocal
from schemas.token import TokenData
from crud.users import get_user
from core.config import SECRET_KEY, ALGORITHM
from db.mongo import mongodb

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     cred_exc = HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Bearer"})
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         if username is None:
#             raise cred_exc
#     except JWTError:
#         raise cred_exc
#     user = get_user(db, username)
#     if user is None:
#         raise cred_exc
#     return user
def get_db():
    """
    Provide a Motor (async Mongo) database handle.
    """
    return mongodb

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db),
):
    """
    Decode JWT, fetch the user from MongoDB, and return it.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = await get_user(db, token_data.username)
    if not user:
        raise credentials_exception
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("hashed_password", None)
    return user