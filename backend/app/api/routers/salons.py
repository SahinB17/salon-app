from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.salon import SalonCreate, SalonUpdate, SalonResponse
from app.schemas.salon import SalonBase
from app.schemas.report import ReportResponse
from app.crud import crud_salon, crud_report
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.salon import Salon
from app.models.service import Service
from sqlalchemy.orm import selectinload
router = APIRouter(prefix="/salons", tags=["Salons"])

class SalonCreateRequest(SalonBase):
    pass

@router.post("/", response_model=SalonResponse, status_code=status.HTTP_201_CREATED)
async def create_salon_endpoint(
    *,
    session: SessionDep,
    salon_in: SalonCreateRequest,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create new salon.
    """
    salon_create = SalonCreate(**salon_in.model_dump(), owner_id=current_user.id)
    salon = await crud_salon.create_salon(db=session, salon_in=salon_create)
    return salon

@router.get("/", response_model=List[SalonResponse])
async def read_salons(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve salons.
    """
    salons = await crud_salon.get_salons(db=session, skip=skip, limit=limit)
    return salons

@router.get("/search/", response_model=List[SalonResponse])
async def search_salons(
    session: SessionDep,
    query: str = "",
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Search salons by name, address, or service name.
    """
    if not query:
        return []

    search_term = f"%{query}%"

    stmt = (
        select(Salon)
        .outerjoin(Salon.services)
        .where(
            or_(
                Salon.name.ilike(search_term),
                Salon.address.ilike(search_term),
                Service.name.ilike(search_term)
            )
        )
        .distinct()
        .options(
            selectinload(Salon.services),
            selectinload(Salon.staffs),
            selectinload(Salon.reviews)
        )
        .offset(skip)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())

@router.get("/{salon_id}", response_model=SalonResponse)
async def read_salon(
    salon_id: int,
    session: SessionDep,
) -> Any:
    """
    Get salon by ID.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    return salon

@router.put("/{salon_id}", response_model=SalonResponse)
async def update_salon_endpoint(
    *,
    session: SessionDep,
    salon_id: int,
    salon_in: SalonUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update a salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    salon = await crud_salon.update_salon(db=session, db_salon=salon, salon_in=salon_in)
    return salon

@router.delete("/{salon_id}")
async def delete_salon_endpoint(
    salon_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Delete a salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    await crud_salon.delete_salon(db=session, salon_id=salon_id)
    return {"status": "success", "message": "Salon deleted successfully"}

@router.get("/{salon_id}/reports", response_model=ReportResponse)
async def get_reports_endpoint(
    salon_id: int,
    session: SessionDep,
    report_type: str = "daily",
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get daily or monthly revenue and customer reports for a salon.
    Only the owner of the salon can view these reports.
    """
    if report_type not in ["daily", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid report_type. Use 'daily' or 'monthly'")
        
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions to view reports")
        
    report = await crud_report.get_salon_reports(
        db=session, salon_id=salon_id, report_type=report_type
    )
    return report
