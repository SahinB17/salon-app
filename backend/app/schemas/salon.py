from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SalonBase(BaseModel):
    name: str
    address: str
    description: Optional[str] = None
    contact_phone: Optional[str] = None

class SalonCreate(SalonBase):
    owner_id: int

class SalonUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    contact_phone: Optional[str] = None

class SalonResponse(SalonBase):
    id: int
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
