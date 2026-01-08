"""
Person search routes
"""
from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List, Optional
import json
from database import db
from models import UserResponse
from dependencies import get_current_user

router = APIRouter()


@router.get("/search")
async def search_people(
    ministry_name: Optional[str] = Query(None, description="Ministry name to filter by"),
    department_id: Optional[int] = Query(None, description="Department ID to filter by"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(30, ge=1, le=100, description="Number of results to return"),
    current_user: UserResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Search for people by ministry and/or department
    Returns person details with positions and punishments
    Optimized single query using window functions and JSON aggregation
    """
    
    # Build the WHERE clause and parameters based on filters
    where_conditions = []
    query_params = []
    param_index = 1
    
    if ministry_name:
        where_conditions.append(f"d.ministry = ${param_index}")
        query_params.append(ministry_name)
        param_index += 1
    
    if department_id:
        where_conditions.append(f"md.department_id = ${param_index}")
        query_params.append(department_id)
        param_index += 1
    
    where_clause = " AND " + " AND ".join(where_conditions) if where_conditions else ""
    
    # Add limit and offset parameters
    limit_param_index = param_index
    offset_param_index = param_index + 1
    
    # Optimized single query with window functions and JSON aggregation
    query = f"""
        WITH person_positions AS (
            -- Get the highest-ranked position for each person using window function
            SELECT DISTINCT ON (pj.person_id)
                pj.person_id,
                pos.position_name,
                pos.rank as position_rank
            FROM position_join pj
            INNER JOIN positions pos ON pj.position_id = pos.position_id
            ORDER BY pj.person_id, pos.rank ASC NULLS LAST
        ),
        person_punishments AS (
            -- Aggregate punishments as JSON for each person
            SELECT 
                pj.person_id,
                COALESCE(json_agg(pun.punishment_description), '[]'::json) as punishments
            FROM punishment_join pj
            INNER JOIN punishments pun ON pj.punishment_id = pun.punishment_id
            GROUP BY pj.person_id
        ),
        filtered_people AS (
            -- Get filtered people with count
            SELECT 
                p.id,
                p.name,
                p.nrc_no,
                p.blood_group,
                p.religion,
                p.race,
                p.spouse_name,
                p.father_name,
                p.mother_name,
                p.birthdate,
                p.appointment_date,
                p.retire_date,
                p.entry_date,
                p.depletion_type,
                p.sac,
                d.department,
                d.ministry,
                COUNT(*) OVER() as total_count
            FROM person p
            INNER JOIN md_join md ON p.id = md.person_id
            INNER JOIN departments d ON md.department_id = d.department_id
            {where_clause}
        )
        SELECT 
            fp.*,
            pp.position_name,
            pp.position_rank,
            COALESCE(pun.punishments, '[]'::json) as punishments
        FROM filtered_people fp
        LEFT JOIN person_positions pp ON fp.id = pp.person_id
        LEFT JOIN person_punishments pun ON fp.id = pun.person_id
        ORDER BY pp.position_rank ASC NULLS LAST, fp.name ASC
        LIMIT ${limit_param_index} OFFSET ${offset_param_index}
    """
    
    people = await db.fetch_all(query, *query_params, limit, offset)
    
    if not people:
        return {
            'people': [],
            'total': 0,
            'offset': offset,
            'limit': limit,
            'has_more': False
        }
    
    # Get total count from the first row (window function)
    total_count = people[0]['total_count'] if people else 0
    
    # Parse punishments JSON and format results
    results = []
    for person in people:
        # Parse punishments if it's a string
        punishments = json.loads(person['punishments']) if isinstance(person['punishments'], str) else (person['punishments'] or [])
        
        results.append({
            'id': str(person['id']),
            'name': person['name'],
            'nrc_no': person['nrc_no'],
            'blood_group': person['blood_group'],
            'religion': person['religion'],
            'race': person['race'],
            'spouse_name': person['spouse_name'],
            'father_name': person['father_name'],
            'mother_name': person['mother_name'],
            'birthdate': person['birthdate'].isoformat() if person['birthdate'] else None,
            'appointment_date': person['appointment_date'].isoformat() if person['appointment_date'] else None,
            'retire_date': person['retire_date'].isoformat() if person['retire_date'] else None,
            'entry_date': person['entry_date'].isoformat() if person['entry_date'] else None,
            'depletion_type': person['depletion_type'],
            'sac': person['sac'],
            'department': person['department'],
            'ministry': person['ministry'],
            'position_name': person['position_name'],
            'position_rank': person['position_rank'],
            'punishments': punishments
        })
    
    return {
        'people': results,
        'total': total_count,
        'offset': offset,
        'limit': limit,
        'has_more': offset + limit < total_count
    }


@router.get("/{person_id}/details")
async def get_person_details(
    person_id: str,
    current_user: UserResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get complete details for a specific person
    Optimized single query using JSON aggregation
    """
    
    # Single optimized query that fetches everything at once
    query = """
        SELECT 
            p.*,
            d.department,
            d.ministry,
            -- Aggregate positions as JSON
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'name', pos.position_name,
                            'rank', pos.rank
                        ) ORDER BY pos.rank ASC NULLS LAST
                    )
                    FROM position_join pj
                    INNER JOIN positions pos ON pj.position_id = pos.position_id
                    WHERE pj.person_id = p.id
                ),
                '[]'::json
            ) as positions,
            -- Aggregate punishments as JSON
            COALESCE(
                (
                    SELECT json_agg(pun.punishment_description)
                    FROM punishment_join pj
                    INNER JOIN punishments pun ON pj.punishment_id = pun.punishment_id
                    WHERE pj.person_id = p.id
                ),
                '[]'::json
            ) as punishments,
            -- Aggregate addresses as JSON
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'address', a.address,
                            'permanent', a.permanent
                        )
                    )
                    FROM addresses a
                    WHERE a.person_id = p.id
                ),
                '[]'::json
            ) as addresses,
            -- Aggregate educations as JSON
            COALESCE(
                (
                    SELECT json_agg(e.education_name)
                    FROM education_join ej
                    INNER JOIN educations e ON ej.education_id = e.education_id
                    WHERE ej.person_id = p.id
                ),
                '[]'::json
            ) as educations,
            -- Aggregate countries as JSON
            COALESCE(
                (
                    SELECT json_agg(c.country_name)
                    FROM country_join cj
                    INNER JOIN countries c ON cj.country_id = c.country_id
                    WHERE cj.person_id = p.id
                ),
                '[]'::json
            ) as countries,
            -- Aggregate trainings as JSON
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'course', t.course,
                            'start_date', t.start_date,
                            'end_date', t.end_date,
                            'location', t.location,
                            'is_international', t.is_international
                        ) ORDER BY t.start_date DESC NULLS LAST
                    )
                    FROM trainings t
                    WHERE t.person_id = p.id
                ),
                '[]'::json
            ) as trainings
        FROM person p
        LEFT JOIN md_join md ON p.id = md.person_id
        LEFT JOIN departments d ON md.department_id = d.department_id
        WHERE p.id = $1
        LIMIT 1
    """
    
    result = await db.fetch_one(query, person_id)
    
    if not result:
        return {'error': 'Person not found'}
    
    # Parse JSON strings (asyncpg returns JSON as strings, not parsed objects)
    positions = json.loads(result['positions']) if isinstance(result['positions'], str) else (result['positions'] or [])
    punishments = json.loads(result['punishments']) if isinstance(result['punishments'], str) else (result['punishments'] or [])
    addresses = json.loads(result['addresses']) if isinstance(result['addresses'], str) else (result['addresses'] or [])
    educations = json.loads(result['educations']) if isinstance(result['educations'], str) else (result['educations'] or [])
    countries = json.loads(result['countries']) if isinstance(result['countries'], str) else (result['countries'] or [])
    trainings_raw = json.loads(result['trainings']) if isinstance(result['trainings'], str) else (result['trainings'] or [])
    
    # Process trainings to format dates
    trainings = []
    for t in trainings_raw:
        if isinstance(t, dict):
            start_date = t.get('start_date')
            end_date = t.get('end_date')
            trainings.append({
                'course': t.get('course'),
                'start_date': start_date if isinstance(start_date, str) else (start_date.isoformat() if start_date else None),
                'end_date': end_date if isinstance(end_date, str) else (end_date.isoformat() if end_date else None),
                'location': t.get('location'),
                'is_international': t.get('is_international')
            })
    
    return {
        'id': str(result['id']),
        'name': result['name'],
        'nrc_no': result['nrc_no'],
        'blood_group': result['blood_group'],
        'religion': result['religion'],
        'race': result['race'],
        'spouse_name': result['spouse_name'],
        'father_name': result['father_name'],
        'mother_name': result['mother_name'],
        'birthdate': result['birthdate'].isoformat() if result['birthdate'] else None,
        'appointment_date': result['appointment_date'].isoformat() if result['appointment_date'] else None,
        'retire_date': result['retire_date'].isoformat() if result['retire_date'] else None,
        'entry_date': result['entry_date'].isoformat() if result['entry_date'] else None,
        'depletion_type': result['depletion_type'],
        'sac': result['sac'],
        'department': result['department'],
        'ministry': result['ministry'],
        'positions': positions,
        'punishments': punishments,
        'addresses': addresses,
        'educations': educations,
        'countries': countries,
        'trainings': trainings
    }
