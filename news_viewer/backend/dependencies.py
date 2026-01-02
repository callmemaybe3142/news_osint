"""
FastAPI dependencies for authentication
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from database import db
from auth_utils import decode_access_token
from models import UserResponse

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserResponse:
    """
    Dependency to get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    username = decode_access_token(token)
    
    if username is None:
        raise credentials_exception
    
    # Fetch user from database
    user = await db.fetch_one(
        "SELECT id, username, created_at, last_login FROM users WHERE username = $1",
        username
    )
    
    if user is None:
        raise credentials_exception
    
    return UserResponse(
        id=user['id'],
        username=user['username'],
        created_at=user['created_at'],
        last_login=user['last_login']
    )
