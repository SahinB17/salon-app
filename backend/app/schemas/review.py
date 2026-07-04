from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    salon_id: int
    customer_id: int
    created_at: datetime
    customer: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
