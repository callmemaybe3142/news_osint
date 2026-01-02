"""
Authentication routes
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from database import db
from models import UserLogin, Token, UserResponse, ChangePassword
from auth_utils import verify_password, create_access_token
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT token
    """
    # Fetch user from database
    user = await db.fetch_one(
        "SELECT id, username, password_hash FROM users WHERE username = $1",
        credentials.username
    )
    
    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    await db.execute(
        "UPDATE users SET last_login = $1 WHERE id = $2",
        datetime.utcnow(),
        user['id']
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user['username']})
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/logout")
async def logout(current_user: UserResponse = Depends(get_current_user)):
    """
    Logout endpoint (client should discard token)
    """
    return {"message": "Successfully logged out"}


@router.post("/change-password")
async def change_password(
    request: ChangePassword,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Change user password
    """
    from auth_utils import hash_password
    
    # Fetch user with password hash
    user = await db.fetch_one(
        "SELECT id, password_hash FROM users WHERE id = $1",
        current_user.id
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(request.current_password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Hash new password and update
    new_password_hash = hash_password(request.new_password)
    
    await db.execute(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        new_password_hash,
        current_user.id
    )
    
    return {"message": "Password changed successfully"}


