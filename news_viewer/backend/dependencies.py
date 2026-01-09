"""
FastAPI dependencies for authentication and role-based access control
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Callable
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
    
    # Fetch user from database (including role)
    user = await db.fetch_one(
        "SELECT id, username, role, created_at, last_login FROM users WHERE username = $1",
        username
    )
    
    if user is None:
        raise credentials_exception
    
    return UserResponse(
        id=user['id'],
        username=user['username'],
        role=user.get('role', 0),  # Default to 0 if role not set
        created_at=user['created_at'],
        last_login=user['last_login']
    )


def require_role(minimum_role: int) -> Callable:
    """
    Dependency factory to require a minimum role level
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(user: UserResponse = Depends(require_role(2))):
            ...
    
    Args:
        minimum_role: Minimum role level required (0, 1, 2, etc.)
    
    Returns:
        Dependency function that checks user role
    """
    async def role_checker(
        current_user: UserResponse = Depends(get_current_user)
    ) -> UserResponse:
        if current_user.role < minimum_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {minimum_role}, your role: {current_user.role}"
            )
        return current_user
    
    return role_checker
