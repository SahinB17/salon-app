from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, time
from app.schemas.service import ServiceResponse

class StaffBase(BaseModel):
    full_name: str
    specialty: Optional[str] = None
    is_active: Optional[bool] = True
    work_start: Optional[time] = None
    work_end: Optional[time] = None
    working_days: Optional[str] = None

class StaffCreate(StaffBase):
    salon_id: int
    service_ids: Optional[List[int]] = None

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    is_active: Optional[bool] = None
    work_start: Optional[time] = None
    work_end: Optional[time] = None
    working_days: Optional[str] = None
    service_ids: Optional[List[int]] = None

class StaffResponse(BaseModel):
    id: int
    salon_id: int
    full_name: str
    specialty: Optional[str] = None
    is_active: bool
    work_start: Optional[time] = None
    work_end: Optional[time] = None
    working_days: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    services: Optional[List[ServiceResponse]] = []

    model_config = ConfigDict(from_attributes=True)
