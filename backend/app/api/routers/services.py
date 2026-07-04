from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.crud import crud_service
from app.crud import crud_salon

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service_endpoint(
    *,
    session: SessionDep,
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create new service for a salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=service_in.salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    service = await crud_service.create_service(db=session, service_in=service_in)
    return service

@router.get("/salon/{salon_id}", response_model=List[ServiceResponse])
async def read_services_by_salon(
    salon_id: int,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve services for a specific salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    
    services = await crud_service.get_services_by_salon(db=session, salon_id=salon_id, skip=skip, limit=limit)
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
async def read_service(
    service_id: int,
    session: SessionDep,
) -> Any:
    """
    Get service by ID.
    """
    service = await crud_service.get_service(db=session, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service_endpoint(
    *,
    session: SessionDep,
    service_id: int,
    service_in: ServiceUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update a service.
    """
    service = await crud_service.get_service(db=session, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    salon = await crud_salon.get_salon(db=session, salon_id=service.salon_id)
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    service = await crud_service.update_service(db=session, db_service=service, service_in=service_in)
    return service

@router.delete("/{service_id}")
async def delete_service_endpoint(
    service_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Delete a service.
    """
    service = await crud_service.get_service(db=session, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    salon = await crud_salon.get_salon(db=session, salon_id=service.salon_id)
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    await crud_service.delete_service(db=session, service_id=service_id)
    return {"status": "success", "message": "Service deleted successfully"}
