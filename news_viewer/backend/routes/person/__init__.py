"""
Person routes package
Handles all person-related API endpoints
"""
from fastapi import APIRouter
from .ministry import router as ministry_router
from .search import router as search_router
from .position import router as position_router

# Create main person router
router = APIRouter(prefix="/person", tags=["Person"])

# Include sub-routers
router.include_router(ministry_router)
router.include_router(search_router)
router.include_router(position_router)
