---
name: create-fastapi-router
description: Standard template for creating a new CRUD API endpoint.
---

# FastAPI Router Template

When creating a router for a new resource (e.g., `services`), follow this template:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

# Change imports according to your project structure
from app.db.session import get_db
from app.schemas.service import ServiceCreate, ServiceResponse
from app.crud import crud_service

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_in: ServiceCreate,
    db: AsyncSession = Depends(get_db)
    # current_user = Depends(get_current_active_user) # Add if needed
):
    """Creates a new service."""
    new_service = await crud_service.create(db=db, obj_in=service_in)
    return new_service

@router.get("/", response_model=List[ServiceResponse])
async def read_services(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    """Fetches all services."""
    services = await crud_service.get_multi(db=db, skip=skip, limit=limit)
    return services

# Update and Delete endpoints should be added with the same logic...
```

**Steps:**
1. Create the router file in the `app/api/routers/` folder.
2. Create the Pydantic schemas under `app/schemas/`.
3. Write the CRUD functions under `app/crud/`.
4. Register the created router in the `main.py` file using `app.include_router(...)`.
