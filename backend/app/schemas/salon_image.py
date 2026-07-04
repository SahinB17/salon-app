from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class SalonImageBase(BaseModel):
    image_url: str

class SalonImageCreate(SalonImageBase):
    salon_id: int

class SalonImageResponse(SalonImageBase):
    id: int
    salon_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
