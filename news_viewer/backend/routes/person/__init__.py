"""
Person routes package
Handles all person-related API endpoints
Requires role 2 or higher (Admin access)
"""
from fastapi import APIRouter, Depends
from dependencies import require_role
from .ministry import router as ministry_router
from .search import router as search_router
from .position import router as position_router

# Create main person router with role requirement
# All person routes require role >= 2 (Admin access)
router = APIRouter(
    prefix="/person", 
    tags=["Person"],
    dependencies=[Depends(require_role(1))]  # Require role 2 or higher
)

# Include sub-routers
router.include_router(ministry_router)
router.include_router(search_router)
router.include_router(position_router)
