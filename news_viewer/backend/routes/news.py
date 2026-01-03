"""
News routes for fetching messages
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from typing import Optional
from pathlib import Path
from database import db
from models import UserResponse
from dependencies import get_current_user
from config import settings
import json

router = APIRouter(prefix="/news", tags=["News"])


@router.get("/raw")
async def get_raw_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    channel_id: Optional[int] = None,
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search_text: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get raw news messages with pagination and filtering
    Excludes forwarded and duplicate messages
    Groups messages by grouped_id
    
    Filters:
    - channel_id: Filter by specific channel
    - category: Filter by channel category
    - date_from: Filter messages from this date (YYYY-MM-DD)
    - date_to: Filter messages until this date (YYYY-MM-DD)
    - search_text: Search in message text (supports partial matching)
    """
    offset = (page - 1) * page_size
    
    # Build query - get unique grouped_ids or individual messages
    where_conditions = ["is_forwarded = 0", "is_duplicate = 0"]
    params = []
    param_count = 1
    
    if channel_id:
        where_conditions.append(f"m.channel_id = ${param_count}")
        params.append(channel_id)
        param_count += 1
    
    if category:
        where_conditions.append(f"c.category = ${param_count}")
        params.append(category)
        param_count += 1
    
    if date_from:
        where_conditions.append(f"m.message_datetime >= ${param_count}")
        # Convert string to datetime
        from datetime import datetime
        params.append(datetime.strptime(f"{date_from} 00:00:00", "%Y-%m-%d %H:%M:%S"))
        param_count += 1
    
    if date_to:
        where_conditions.append(f"m.message_datetime <= ${param_count}")
        # Convert string to datetime
        from datetime import datetime
        params.append(datetime.strptime(f"{date_to} 23:59:59", "%Y-%m-%d %H:%M:%S"))
        param_count += 1
    
    if search_text:
        # Use trigram similarity for partial text matching (supports Burmese and other languages)
        where_conditions.append(f"m.message_text ILIKE ${param_count}")
        params.append(f"%{search_text}%")
        param_count += 1
    
    where_clause = " AND ".join(where_conditions)
    

    # Use materialized view for faster counting when no filters
    if not channel_id and not category and not date_from and not date_to and not search_text:
        count_query = "SELECT COUNT(*) as total FROM mv_grouped_messages"
        total_result = await db.fetch_one(count_query)
    else:
        count_query = f"""
            SELECT COUNT(DISTINCT COALESCE(grouped_id::text, id::text)) as total
            FROM messages m
            LEFT JOIN channels c ON m.channel_id = c.telegram_channel_id
            WHERE {where_clause}
        """
        total_result = await db.fetch_one(count_query, *params)
    total = total_result['total'] if total_result else 0
    
    # Get messages grouped by grouped_id
    # For each group, we'll get all messages and their images
    messages_query = f"""
        WITH grouped_messages AS (
            SELECT 
                COALESCE(grouped_id::text, id::text) as group_key,
                MIN(id) as first_message_id,
                MIN(message_datetime) as group_datetime
            FROM messages m
            LEFT JOIN channels c ON m.channel_id = c.telegram_channel_id
            WHERE {where_clause}
            GROUP BY COALESCE(grouped_id::text, id::text)
            ORDER BY group_datetime DESC
            LIMIT ${param_count} OFFSET ${param_count + 1}
        )
        SELECT 
            m.id,
            m.channel_id,
            m.message_id,
            m.message_text,
            m.message_datetime,
            m.has_media,
            m.grouped_id,
            EXISTS(SELECT 1 FROM user_favorites uf WHERE uf.news_id = m.id AND uf.user_id = ${param_count + 2}) as is_favorited,
            c.name as channel_name,
            c.display_name as channel_display_name,
            gm.group_key,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', i.id,
                        'file_path', i.file_path,
                        'width', i.width,
                        'height', i.height
                    ) ORDER BY i.id
                ) FILTER (WHERE i.id IS NOT NULL),
                '[]'
            ) as images
        FROM grouped_messages gm
        JOIN messages m ON COALESCE(m.grouped_id::text, m.id::text) = gm.group_key
        LEFT JOIN channels c ON m.channel_id = c.telegram_channel_id
        LEFT JOIN images i ON m.channel_id = i.message_channel_id 
            AND m.message_id = i.message_message_id
        GROUP BY m.id, m.channel_id, m.message_id, m.message_text, 
                 m.message_datetime, m.has_media, m.grouped_id,
                 c.name, c.display_name, gm.group_key, gm.group_datetime
        ORDER BY gm.group_datetime DESC, m.id ASC
    """
    
    params.extend([page_size, offset, current_user.id])
    messages = await db.fetch_all(messages_query, *params)
    
    # Group messages by group_key
    grouped_data = {}
    for msg in messages:
        group_key = msg['group_key']
        
        # Parse images if it's a string
        images = msg['images']
        if isinstance(images, str):
            images = json.loads(images)
        
        if group_key not in grouped_data:
            grouped_data[group_key] = {
                "id": msg['id'],
                "channel_id": msg['channel_id'],
                "message_id": msg['message_id'],
                "message_text": msg['message_text'] or "",  # First message usually has text
                "message_datetime": msg['message_datetime'].isoformat(),
                "has_media": bool(msg['has_media']),
                "grouped_id": msg['grouped_id'],
                "is_favorited": msg['is_favorited'],
                "channel_name": msg['channel_name'],
                "channel_display_name": msg['channel_display_name'],
                "images": []
            }
        
        # Add images from this message to the group
        if images:
            grouped_data[group_key]["images"].extend(images)
        
        # If this message has text and the group doesn't, use it
        if msg['message_text'] and not grouped_data[group_key]["message_text"]:
            grouped_data[group_key]["message_text"] = msg['message_text']
    
    # Convert to list
    messages_list = list(grouped_data.values())
    
    return {
        "messages": messages_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    }



@router.get("/favorites")
async def get_favorite_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get favorite news messages with pagination
    Orders by when they were added to favorites (newest first)
    """
    offset = (page - 1) * page_size
    
    # Count total favorites
    count_query = "SELECT COUNT(*) as total FROM user_favorites WHERE user_id = $1"
    total_result = await db.fetch_one(count_query, current_user.id)
    total = total_result['total'] if total_result else 0
    
    if total == 0:
        return {
            "messages": [],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": 0,
                "total_pages": 0
            }
        }

    # Get favorite messages detailed info
    messages_query = """
        WITH fav_messages AS (
            SELECT news_id, created_at
            FROM user_favorites 
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        )
        SELECT 
            m.id,
            m.channel_id,
            m.message_id,
            m.message_text,
            m.message_datetime,
            m.has_media,
            m.grouped_id,
            true as is_favorited,
            c.name as channel_name,
            c.display_name as channel_display_name,
            fm.created_at as fav_created_at,
            COALESCE(
                 json_agg(
                    json_build_object(
                        'id', i.id,
                        'file_path', i.file_path,
                        'width', i.width,
                        'height', i.height
                    ) ORDER BY i.id
                ) FILTER (WHERE i.id IS NOT NULL),
                '[]'
            ) as images
        FROM fav_messages fm
        JOIN messages m ON fm.news_id = m.id
        LEFT JOIN channels c ON m.channel_id = c.telegram_channel_id
        
        -- Join to find all peer messages in the group to get all images
        LEFT JOIN messages peer_m ON 
            (m.grouped_id IS NOT NULL AND m.grouped_id = peer_m.grouped_id)
            OR 
            (m.grouped_id IS NULL AND m.id = peer_m.id)
            
        -- Join images for ALL peer messages
        LEFT JOIN images i ON peer_m.channel_id = i.message_channel_id 
            AND peer_m.message_id = i.message_message_id
            
        GROUP BY m.id, m.channel_id, m.message_id, m.message_text, 
                 m.message_datetime, m.has_media, m.grouped_id,
                 c.name, c.display_name, fm.created_at
        ORDER BY fm.created_at DESC
    """
    
    messages = await db.fetch_all(messages_query, current_user.id, page_size, offset)
    
    # Process messages to parse images JSON
    messages_list = []
    for msg in messages:
        msg_dict = dict(msg)
        # Parse images if needed
        if isinstance(msg_dict['images'], str):
             msg_dict['images'] = json.loads(msg_dict['images'])
        
        # Convert datetime to string
        msg_dict['message_datetime'] = msg_dict['message_datetime'].isoformat()
        # Remove fav_created_at from final output if not needed for frontend logic, but keeping it doesn't hurt
        del msg_dict['fav_created_at']
        
        messages_list.append(msg_dict)
    
    return {
        "messages": messages_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    }


@router.get("/channels")
async def get_channels(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all channels
    """
    channels = await db.fetch_all(
        """
        SELECT 
            telegram_channel_id,
            name,
            display_name,
            category
        FROM channels
        ORDER BY display_name
        """
    )
    
    return [
        {
            "id": ch['telegram_channel_id'],
            "name": ch['name'],
            "display_name": ch['display_name'],
            "category": ch['category']
        }
        for ch in channels
    ]


@router.get("/images/{file_path:path}")
async def get_image(file_path: str):
    """
    Serve image files from the backend storage
    Note: This endpoint is public to allow browser <img> tags to load images
    Access control is handled at the news listing level
    """
    # Get base path from configuration
    base_path = Path(settings.IMAGES_BASE_PATH)
    
    # The file_path from database already has backslashes (e.g., "2025\12\13\Hno969888\6190587795865275209.jpg")
    # When it comes through the URL, backslashes are converted to forward slashes
    # So we need to convert forward slashes back to backslashes for Windows
    normalized_path = file_path.replace('/', '\\')
    
    # Build full path
    full_path = base_path / normalized_path
    
    # Security check: ensure the path is within the base directory
    try:
        full_path = full_path.resolve()
        base_path = base_path.resolve()
        if not str(full_path).startswith(str(base_path)):
            raise ValueError("Invalid path")
    except Exception:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    # Check if file exists
    if not full_path.exists() or not full_path.is_file():
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    return FileResponse(full_path)


@router.post("/{message_id}/favorite")
async def toggle_favorite(
    message_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Toggle favorite status for a message
    """
    # Check if already favorited
    existing = await db.fetch_one(
        "SELECT 1 FROM user_favorites WHERE user_id = $1 AND news_id = $2",
        current_user.id, message_id
    )
    
    if existing:
        await db.execute(
            "DELETE FROM user_favorites WHERE user_id = $1 AND news_id = $2",
            current_user.id, message_id
        )
        return {"status": "removed", "is_favorited": False}
    else:
        await db.execute(
            "INSERT INTO user_favorites (user_id, news_id) VALUES ($1, $2)",
            current_user.id, message_id
        )
        return {"status": "added", "is_favorited": True}

