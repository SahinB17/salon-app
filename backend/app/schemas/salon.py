from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, time
from .service import ServiceResponse
from .staff import StaffResponse
from .salon_image import SalonImageResponse

class SalonBase(BaseModel):
    name: str
    address: str
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SalonCreate(SalonBase):
    owner_id: int
    image_url: Optional[str] = None

class SalonUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SalonResponse(SalonBase):
    id: int
    owner_id: int
    services: List[ServiceResponse] = []
    staffs: List[StaffResponse] = []
    images: List[SalonImageResponse] = []
    average_rating: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
