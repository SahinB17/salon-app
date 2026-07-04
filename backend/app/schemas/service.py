from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int

class ServiceCreate(ServiceBase):
    salon_id: int

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None

class ServiceResponse(ServiceBase):
    id: int
    salon_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
