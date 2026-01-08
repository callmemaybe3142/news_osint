"""
Ministry and department structure routes
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any
from database import db
from models import UserResponse
from dependencies import get_current_user

router = APIRouter()


@router.get("/ministry-structure")
async def get_ministry_structure(
    current_user: UserResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get ministry structure with departments
    Returns a hierarchical structure of ministries and their departments
    """
    
    # Get all departments with their ministry information
    query = """
        SELECT 
            department_id,
            department,
            ministry,
            (
                SELECT COUNT(DISTINCT md.person_id)
                FROM md_join md
                WHERE md.department_id = d.department_id
            ) as person_count
        FROM departments d
        ORDER BY ministry, department
    """
    
    departments = await db.fetch_all(query)
    
    # Group departments by ministry
    ministry_structure = {}
    
    for dept in departments:
        ministry = dept['ministry'] or 'Unknown Ministry'
        
        if ministry not in ministry_structure:
            ministry_structure[ministry] = {
                'ministry_name': ministry,
                'departments': [],
                'total_people': 0
            }
        
        ministry_structure[ministry]['departments'].append({
            'department_id': dept['department_id'],
            'department_name': dept['department'] or 'Unknown Department',
            'person_count': dept['person_count']
        })
        
        ministry_structure[ministry]['total_people'] += dept['person_count']
    
    # Convert to list and sort by ministry name
    result = sorted(
        ministry_structure.values(),
        key=lambda x: x['ministry_name']
    )
    
    return {
        'ministries': result,
        'total_ministries': len(result),
        'total_departments': len(departments)
    }
