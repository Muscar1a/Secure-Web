from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from schemas.token import Token
from crud.auth import authenticate_user
from core.security import (
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    pwd_context,
    get_password_hash,
)
from api.deps import get_db
from pydantic import BaseModel, EmailStr, field_validator
import re
from jose import JWTError
from core.email import send_reset_email
from crud.users import get_user_by_email, update_user_password

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db),
):
    """
    Authenticate user and return a JWT access token.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": user["username"]})
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
async def request_password_reset(
    req: PasswordResetRequest,
    db = Depends(get_db),
):
    user = await get_user_by_email(db, req.email)
    # Always 200 to avoid email enumeration
    if user:
        token = create_password_reset_token(user["email"])
        await send_reset_email(user["email"], token)
    return {"msg": "If that email is registered, you’ll receive reset instructions."}

# reset password
from core.security import verify_password
@router.post("/reset-password")
async def reset_password(
    req: ResetPasswordRequest,
    db = Depends(get_db),
):
    # validate & decode token
    try:
        email = verify_password_reset_token(req.token)
    except JWTError:
        raise HTTPException(400, "Invalid or expired token")

    # fetch user
    user = await get_user_by_email(db, email)
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
    await update_user_password(db, str(user["_id"]), hashed)
    return {"msg": "Password has been reset successfully."}