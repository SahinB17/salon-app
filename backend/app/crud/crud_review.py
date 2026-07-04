from typing import List, Optional
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.schemas.review import ReviewCreate
from fastapi import HTTPException

async def create_review(db: AsyncSession, salon_id: int, customer_id: int, review_in: ReviewCreate) -> Review:
    # Check if the customer already reviewed this salon (optional rule, let's allow multiple for now or just one)
    # Let's allow only one review per user per salon to make it realistic
    stmt = select(Review).where(Review.salon_id == salon_id, Review.customer_id == customer_id)
    result = await db.execute(stmt)
    existing_review = result.scalars().first()
    
    if existing_review:
        existing_review.rating = review_in.rating
        existing_review.comment = review_in.comment
        await db.commit()
        await db.refresh(existing_review)
        
        # Load customer for response
        stmt_load = select(Review).options(selectinload(Review.customer)).where(Review.id == existing_review.id)
        res = await db.execute(stmt_load)
        return res.scalars().first()
        
    db_review = Review(
        salon_id=salon_id,
        customer_id=customer_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    
    # Load customer for response
    stmt_load = select(Review).options(selectinload(Review.customer)).where(Review.id == db_review.id)
    res = await db.execute(stmt_load)
    return res.scalars().first()

async def get_salon_reviews(db: AsyncSession, salon_id: int, skip: int = 0, limit: int = 100) -> List[Review]:
    stmt = (
        select(Review)
        .options(selectinload(Review.customer))
        .where(Review.salon_id == salon_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_salon_average_rating(db: AsyncSession, salon_id: int) -> float:
    from sqlalchemy.sql import func
    stmt = select(func.avg(Review.rating)).where(Review.salon_id == salon_id)
    result = await db.execute(stmt)
    avg = result.scalar()
    return round(float(avg), 1) if avg else 0.0
