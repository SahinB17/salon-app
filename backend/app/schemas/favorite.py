from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .salon import SalonResponse

class FavoriteBase(BaseModel):
    salon_id: int

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    salon: Optional[SalonResponse] = None

    class Config:
        from_attributes = True
