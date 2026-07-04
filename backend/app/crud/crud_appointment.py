from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate

async def check_overlapping(
    db: AsyncSession, 
    salon_id: int, 
    staff_id: Optional[int], 
    start_time: datetime, 
    end_time: datetime,
    exclude_appointment_id: Optional[int] = None
) -> bool:
    """
    Check if there is an overlapping appointment.
    Overlapping logic: existing.start < new.end AND new.start < existing.end
    """
    query = select(Appointment).where(
        Appointment.salon_id == salon_id,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.start_time < end_time,
        start_time < Appointment.end_time
    )
    
    # Overlapping strictly by staff_id, if staff is assigned
    if staff_id is not None:
        query = query.where(Appointment.staff_id == staff_id)
    else:
        # If no staff is assigned, assume overlapping checks are disabled or handled differently
        pass
        
    if exclude_appointment_id is not None:
        query = query.where(Appointment.id != exclude_appointment_id)
        
    result = await db.execute(query)
    overlapping = result.scalars().first()
    return overlapping is not None

async def create_appointment(db: AsyncSession, appointment_in: AppointmentCreate, customer_id: int) -> Appointment:
    # Re-check for overlapping appointments just before creating,
    # minimizing the race-condition window against concurrent requests.
    still_overlapping = await check_overlapping(
        db=db,
        salon_id=appointment_in.salon_id,
        staff_id=appointment_in.staff_id,
        start_time=appointment_in.start_time,
        end_time=appointment_in.end_time
    )
    if still_overlapping:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked."
        )

    db_obj = Appointment(
        customer_id=customer_id,
        salon_id=appointment_in.salon_id,
        service_id=appointment_in.service_id,
        staff_id=appointment_in.staff_id,
        start_time=appointment_in.start_time,
        end_time=appointment_in.end_time,
        status=appointment_in.status or "pending"
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_user_appointments(db: AsyncSession, customer_id: int, skip: int = 0, limit: int = 100) -> List[Appointment]:
    result = await db.execute(
        select(Appointment).where(Appointment.customer_id == customer_id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())

async def get_salon_appointments(db: AsyncSession, salon_id: int, skip: int = 0, limit: int = 100) -> List[Appointment]:
    result = await db.execute(
        select(Appointment).where(Appointment.salon_id == salon_id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())

async def get_appointment(db: AsyncSession, appointment_id: int) -> Optional[Appointment]:
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    return result.scalar_one_or_none()

async def update_appointment_status(db: AsyncSession, db_obj: Appointment, status: str) -> Appointment:
    db_obj.status = status
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
