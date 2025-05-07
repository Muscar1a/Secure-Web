from fastapi import Depends, HTTPException, status
import schemas
from datetime import datetime, timedelta
from core.config import settings
from exceptions import credentials_exception
from crud.user import User
from itsdangerous import URLSafeTimedSerializer
from jose import JWTError, jwt


class TokenManager:
    def __init__(self, user_manager: User):
        self.user_manager = user_manager
        self.jwt_secret_key = settings.SECRET_KEY
        self.jwt_algorithm = settings.ALGORITHM
        self.expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    async def get_jwt_access_token(self, subject: str) -> str:
        expire = datetime.utcnow() + self.expires_delta
        payload = {"exp": expire, "sub": subject}
        return jwt.encode(payload, self.jwt_secret_key, algorithm=self.jwt_algorithm)

    async def get_data_form_jwt_token(self, token) -> schemas.TokenPayload:
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret_key,
                algorithms=[self.jwt_algorithm]
            )
            subject: str = payload.get("sub")
            if subject is None:
                raise credentials_exception
            return payload
        except JWTError:
            raise credentials_exception

    async def get_user_form_jwt_token(self, token: str, subject_key: str) -> schemas.User:
        token_data = await self.get_data_form_jwt_token(token)
        subject = token_data.get("sub")

        if subject_key == "id":
            user = await self.user_manager.get_by_id(subject)
        elif subject_key == "email":
            user = await self.user_manager.get_by_email(subject)

        if not user:
            raise credentials_exception
        return user