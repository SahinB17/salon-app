from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, time
from .service import ServiceResponse
from .staff import StaffResponse

class SalonBase(BaseModel):
    name: str
    address: str
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    image_url: Optional[str] = None

class SalonCreate(SalonBase):
    owner_id: int
    image_url: Optional[str] = None

class SalonUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    image_url: Optional[str] = None

class SalonResponse(SalonBase):
    id: int
    owner_id: int
    services: List[ServiceResponse] = []
    staffs: List[StaffResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
