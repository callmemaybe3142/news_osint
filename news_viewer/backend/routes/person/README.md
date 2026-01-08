# Person Routes Module

This directory contains all person-related API endpoints organized by functionality.

## Structure

```
person/
├── __init__.py          # Package initialization, aggregates all routers
├── ministry.py          # Ministry and department structure endpoints
└── README.md           # This file
```

## Adding New Routes

To add new person-related routes:

1. Create a new file in this directory (e.g., `personnel.py`, `positions.py`, etc.)
2. Define your router:
   ```python
   from fastapi import APIRouter
   
   router = APIRouter()
   
   @router.get("/your-endpoint")
   async def your_function():
       pass
   ```

3. Import and include it in `__init__.py`:
   ```python
   from .your_module import router as your_router
   router.include_router(your_router)
   ```

## Current Endpoints

### Ministry Routes (`ministry.py`)
- `GET /person/ministry-structure` - Get hierarchical ministry and department structure

## Future Endpoints (Planned)

Add your planned endpoints here:
- Personnel listing and search
- Position management
- Department details
- Person profiles
- etc.
