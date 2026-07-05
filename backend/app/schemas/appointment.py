from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AppointmentSalonResponse(BaseModel):
    id: int
    name: str
    address: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AppointmentServiceResponse(BaseModel):
    id: int
    name: str
    price: float
    duration_minutes: int

    model_config = ConfigDict(from_attributes=True)

class AppointmentBase(BaseModel):
    start_time: datetime
    end_time: datetime
    status: Optional[str] = "pending"

class AppointmentCreate(AppointmentBase):
    salon_id: int
    service_id: int
    staff_id: Optional[int] = None

class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    staff_id: Optional[int] = None

class AppointmentResponse(AppointmentBase):
    id: int
    customer_id: int
    salon_id: int
    service_id: int
    staff_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    salon: Optional[AppointmentSalonResponse] = None
    service: Optional[AppointmentServiceResponse] = None

    model_config = ConfigDict(from_attributes=True)
