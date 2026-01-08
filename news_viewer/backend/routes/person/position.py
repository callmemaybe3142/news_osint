"""
Position routes
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from database import db
from models import UserResponse
from dependencies import get_current_user

router = APIRouter()


@router.get("/positions")
async def get_positions(
    current_user: UserResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get all positions sorted by rank
    Returns list of positions for typeahead dropdown
    """
    
    query = """
        SELECT 
            position_id,
            position_name,
            rank
        FROM positions
        ORDER BY rank ASC NULLS LAST, position_name ASC
    """
    
    positions = await db.fetch_all(query)
    
    return {
        'positions': [
            {
                'position_id': pos['position_id'],
                'position_name': pos['position_name'],
                'rank': pos['rank']
            }
            for pos in positions
        ],
        'total': len(positions)
    }
