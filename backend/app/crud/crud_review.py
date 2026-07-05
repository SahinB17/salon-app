from typing import List
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.models.staff import Staff
from app.schemas.review import ReviewCreate


async def _recalculate_staff_rating(db: AsyncSession, staff_id: int) -> None:
    """Həmin ustanın bütün rəylərinin ortalamasını hesabla, Staff.rating-i yenilə."""
    stmt = select(func.avg(Review.rating)).where(
        Review.staff_id == staff_id,
        Review.rating.isnot(None)
    )
    result = await db.execute(stmt)
    avg = result.scalar()
    new_rating = round(float(avg), 1) if avg else 5.0

    staff_stmt = select(Staff).where(Staff.id == staff_id)
    staff_result = await db.execute(staff_stmt)
    staff = staff_result.scalars().first()
    if staff:
        staff.rating = new_rating
        await db.commit()


async def create_review(db: AsyncSession, salon_id: int, customer_id: int, review_in: ReviewCreate) -> Review:
    # Hər istifadəçi bir salon üçün yalnız 1 rəy yaza bilər — əgər mövcuddursa, üzərinə yazılır
    stmt = select(Review).where(Review.salon_id == salon_id, Review.customer_id == customer_id)
    result = await db.execute(stmt)
    existing_review = result.scalars().first()

    if existing_review:
        old_staff_id = existing_review.staff_id
        existing_review.rating = review_in.rating
        existing_review.comment = review_in.comment
        existing_review.staff_id = review_in.staff_id
        await db.commit()
        await db.refresh(existing_review)

        # Köhnə ustanın reytinqini də yenilə (əgər usta dəyişibsə)
        if old_staff_id and old_staff_id != review_in.staff_id:
            await _recalculate_staff_rating(db, old_staff_id)
        if review_in.staff_id:
            await _recalculate_staff_rating(db, review_in.staff_id)

        stmt_load = select(Review).options(selectinload(Review.customer)).where(Review.id == existing_review.id)
        res = await db.execute(stmt_load)
        return res.scalars().first()

    db_review = Review(
        salon_id=salon_id,
        customer_id=customer_id,
        rating=review_in.rating,
        comment=review_in.comment,
        staff_id=review_in.staff_id,
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)

    # Yeni ustanın reytinqini yenilə
    if review_in.staff_id:
        await _recalculate_staff_rating(db, review_in.staff_id)

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
    stmt = select(func.avg(Review.rating)).where(Review.salon_id == salon_id)
    result = await db.execute(stmt)
    avg = result.scalar()
    return round(float(avg), 1) if avg else 0.0
