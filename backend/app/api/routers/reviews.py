from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.crud import crud_review, crud_salon

router = APIRouter()

@router.post("/salon/{salon_id}", response_model=ReviewResponse)
async def create_salon_review(
    salon_id: int,
    review_in: ReviewCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create or update a review for a salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    if review_in.rating < 1 or review_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    review = await crud_review.create_review(
        db=session, 
        salon_id=salon_id, 
        customer_id=current_user.id, 
        review_in=review_in
    )
    return review

@router.get("/salon/{salon_id}", response_model=List[ReviewResponse])
async def get_salon_reviews(
    salon_id: int,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all reviews for a salon.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    reviews = await crud_review.get_salon_reviews(db=session, salon_id=salon_id, skip=skip, limit=limit)
    return reviews
