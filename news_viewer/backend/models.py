"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserLogin(BaseModel):
    """Login request model"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    username: Optional[str] = None


class UserResponse(BaseModel):
    """User response model"""
    id: int
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None


class ChangePassword(BaseModel):
    """Change password request model"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

