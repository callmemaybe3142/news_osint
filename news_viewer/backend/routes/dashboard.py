"""
Dashboard routes (placeholder)
"""
from fastapi import APIRouter, Depends
from models import UserResponse
from dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(current_user: UserResponse = Depends(get_current_user)):
    """
    Get dashboard statistics (placeholder)
    """
    return {
        "message": "Dashboard stats endpoint",
        "user": current_user.username,
        "stats": {
            "total_messages": 0,
            "total_channels": 0,
            "total_images": 0
        }
    }
