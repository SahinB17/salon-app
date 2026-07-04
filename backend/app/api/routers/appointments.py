from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.crud import crud_appointment, crud_salon, crud_service, crud_notification
from app.schemas.notification import NotificationCreate

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment_endpoint(
    *,
    session: SessionDep,
    appointment_in: AppointmentCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a new appointment (booking).
    Checks for overlapping times.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=appointment_in.salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    service = await crud_service.get_service(db=session, service_id=appointment_in.service_id)
    if not service or service.salon_id != salon.id:
        raise HTTPException(status_code=400, detail="Invalid service for this salon")
        
    # Check staff if provided
    if appointment_in.staff_id:
        from app.crud import crud_staff
        staff = await crud_staff.get_staff(db=session, staff_id=appointment_in.staff_id)
        if not staff or staff.salon_id != salon.id or not staff.is_active:
            raise HTTPException(status_code=400, detail="Invalid or inactive staff for this salon")
        
        # Check working days (Python weekday(): 0=Mon, ..., 6=Sun. Our database: 1=Mon, ..., 7=Sun)
        day_of_week = str(appointment_in.start_time.weekday() + 1)
        if staff.working_days:
            working_days_list = [d.strip() for d in staff.working_days.split(',')]
            if day_of_week not in working_days_list:
                raise HTTPException(
                    status_code=400,
                    detail="Usta bu gün işləmir."
                )
        
        # Check working hours
        if staff.work_start and staff.work_end:
            start_t = appointment_in.start_time.time()
            end_t = appointment_in.end_time.time()
            if start_t < staff.work_start or end_t > staff.work_end:
                raise HTTPException(
                    status_code=400,
                    detail=f"Ustanın fərdi iş saatlarından kənardır ({staff.work_start.strftime('%H:%M')} - {staff.work_end.strftime('%H:%M')})"
                )

    # Check working hours
    if salon.open_time and salon.close_time:
        start_t = appointment_in.start_time.time()
        end_t = appointment_in.end_time.time()
        if start_t < salon.open_time or end_t > salon.close_time:
            raise HTTPException(
                status_code=400, 
                detail=f"Appointment is outside salon working hours ({salon.open_time} - {salon.close_time})"
            )
        
    is_overlapping = await crud_appointment.check_overlapping(
        db=session,
        salon_id=appointment_in.salon_id,
        staff_id=appointment_in.staff_id,
        start_time=appointment_in.start_time,
        end_time=appointment_in.end_time
    )
    if is_overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked."
        )
        
    appointment = await crud_appointment.create_appointment(
        db=session, appointment_in=appointment_in, customer_id=current_user.id
    )
    
    # Notify the salon owner about the new reservation
    try:
        await crud_notification.create_notification(
            db=session,
            notification_in=NotificationCreate(
                user_id=salon.owner_id,
                title="Yeni Rezervasiya!",
                message=f"Müştəri {current_user.full_name or 'İstifadəçi'} {appointment.start_time.strftime('%Y-%m-%d %H:%M')} tarixinə {service.name} xidməti üçün yazıldı."
            )
        )
    except Exception as e:
        print(f"Failed to create notification for salon owner: {e}")
        
    return appointment

@router.get("/me", response_model=List[AppointmentResponse])
async def read_user_appointments(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve current user's appointments.
    """
    appointments = await crud_appointment.get_user_appointments(
        db=session, customer_id=current_user.id, skip=skip, limit=limit
    )
    return appointments

@router.get("/salon/{salon_id}", response_model=List[AppointmentResponse])
async def read_salon_appointments(
    salon_id: int,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve appointments for a salon (only accessible by salon owner).
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if salon.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    appointments = await crud_appointment.get_salon_appointments(
        db=session, salon_id=salon_id, skip=skip, limit=limit
    )
    return appointments

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status_endpoint(
    appointment_id: int,
    new_status: str,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update the status of an appointment (e.g. cancelled, confirmed).
    """
    appointment = await crud_appointment.get_appointment(db=session, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    salon = await crud_salon.get_salon(db=session, salon_id=appointment.salon_id)
    if appointment.customer_id != current_user.id and (not salon or salon.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    valid_statuses = ["pending", "confirmed", "cancelled", "completed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    appointment = await crud_appointment.update_appointment_status(db=session, db_obj=appointment, status=new_status)
    
    # Notify the customer about the status update
    try:
        service = await crud_service.get_service(db=session, service_id=appointment.service_id)
        status_msg = "təsdiqləndi" if new_status == "confirmed" else "ləğv edildi" if new_status == "cancelled" else "tamamlandı" if new_status == "completed" else new_status
        await crud_notification.create_notification(
            db=session,
            notification_in=NotificationCreate(
                user_id=appointment.customer_id,
                title=f"Rezervasiya {status_msg}!",
                message=f"{salon.name} salonunda {appointment.start_time.strftime('%Y-%m-%d %H:%M')} tarixinə olan {service.name if service else 'xidmət'} üzrə rezervasiyanız {status_msg}."
            )
        )
    except Exception as e:
        print(f"Failed to create notification for customer: {e}")
        
    return appointment

@router.get("/salon/{salon_id}/slots")
async def get_booked_slots(
    salon_id: int,
    date: str,
    session: SessionDep,
    staff_id: Optional[int] = None,
) -> Any:
    """
    Get booked time slots and staff working shifts for a salon on a specific date.
    """
    from datetime import datetime, timedelta
    
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)
    
    from sqlalchemy.future import select
    from app.models.appointment import Appointment
    
    stmt = select(Appointment).where(
        Appointment.salon_id == salon_id,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.start_time >= day_start,
        Appointment.start_time < day_end
    )

    # Filter by staff_id when a specific staff is selected
    if staff_id is not None:
        stmt = stmt.where(Appointment.staff_id == staff_id)

    result = await session.execute(stmt)
    appointments = result.scalars().all()
    
    booked = [
        {
            "start_time": apt.start_time.isoformat(),
            "end_time": apt.end_time.isoformat(),
            "staff_id": apt.staff_id
        }
        for apt in appointments
    ]

    # Staff work shift metadata
    work_start = None
    work_end = None
    is_working_day = True

    if staff_id:
        from app.crud import crud_staff
        staff = await crud_staff.get_staff(db=session, staff_id=staff_id)
        if staff:
            if staff.work_start:
                work_start = staff.work_start.strftime("%H:%M")
            if staff.work_end:
                work_end = staff.work_end.strftime("%H:%M")
            
            # Check working day (1=Mon, ..., 7=Sun)
            day_of_week = str(target_date.weekday() + 1)
            if staff.working_days:
                working_days_list = [d.strip() for d in staff.working_days.split(',')]
                is_working_day = day_of_week in working_days_list

    return {
        "booked_slots": booked,
        "work_start": work_start,
        "work_end": work_end,
        "is_working_day": is_working_day
    }


