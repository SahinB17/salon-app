from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class StaffBase(BaseModel):
    full_name: str
    specialty: Optional[str] = None
    is_active: Optional[bool] = True

class StaffCreate(StaffBase):
    salon_id: int

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    is_active: Optional[bool] = None

class StaffResponse(StaffBase):
    id: int
    salon_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
