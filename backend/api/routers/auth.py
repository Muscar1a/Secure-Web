from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
import re
from jose import JWTError

from api.deps import get_token_manager, get_user_manager
from services.token import TokenManager
from schemas.token import Token
import schemas
from crud.user import User
from core.security import (
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    verify_password,
    get_password_hash,
)

from core.email import send_reset_email

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_manager: User = Depends(get_user_manager),
    token_manager: TokenManager = Depends(get_token_manager),
) -> Any:
    user = await user_manager.authenticate(form_data)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect username or password",
            # headers={"WWW-Authenticate": "Bearer"},
        )
    # access_token = create_access_token({"sub": user.username})
    subject = user.get('id')
    """
        Here we use id for further access token generation.
    """
    access_token = await token_manager.get_jwt_access_token(subject)
    return {"access_token": access_token, "token_type": "bearer"}


class PasswordResetRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        return v
    
# request reset
@router.post("/request-password-reset")
async def request_password_reset(req: PasswordResetRequest):
    user = await get_user_by_email(req.email)
    # Always 200 to avoid email enumeration
    if user:
        token = create_password_reset_token(user["email"])
        await send_reset_email(user["email"], token)
    return {"msg": "If that email is registered, you’ll receive reset instructions."}

# reset password
from core.security import verify_password
@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    # validate & decode token
    try:
        email = verify_password_reset_token(req.token)
    except JWTError:
        raise HTTPException(400, "Invalid or expired token")

    # fetch user
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(404, "User not found")

    # forbid same‐as‐old
    if verify_password(req.new_password, user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password"
        )

    # now safe to hash & update
    hashed = get_password_hash(req.new_password)
    await update_user_password(str(user["_id"]), hashed)
    return {"msg": "Password has been reset successfully."}

