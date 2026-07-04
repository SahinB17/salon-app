from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.crud import crud_staff, crud_salon

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff_endpoint(
    *,
    session: SessionDep,
    staff_in: StaffCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    salon = await crud_salon.get_salon(db=session, salon_id=staff_in.salon_id)
    if not salon or salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await crud_staff.create_staff(db=session, staff_in=staff_in)

@router.get("/salon/{salon_id}", response_model=List[StaffResponse])
async def read_staff_by_salon(
    salon_id: int,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return await crud_staff.get_staff_by_salon(db=session, salon_id=salon_id, skip=skip, limit=limit)

@router.patch("/{staff_id}", response_model=StaffResponse)
async def update_staff_endpoint(
    staff_id: int,
    staff_in: StaffUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    staff = await crud_staff.get_staff(db=session, staff_id=staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    salon = await crud_salon.get_salon(db=session, salon_id=staff.salon_id)
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await crud_staff.update_staff(db=session, db_staff=staff, staff_in=staff_in)
