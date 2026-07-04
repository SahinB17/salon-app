from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteCreate

async def add_favorite(db: AsyncSession, user_id: int, salon_id: int) -> Favorite:
    stmt = select(Favorite).where(Favorite.user_id == user_id, Favorite.salon_id == salon_id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing
        
    db_favorite = Favorite(user_id=user_id, salon_id=salon_id)
    db.add(db_favorite)
    await db.commit()
    await db.refresh(db_favorite)
    return db_favorite

async def remove_favorite(db: AsyncSession, user_id: int, salon_id: int) -> bool:
    stmt = select(Favorite).where(Favorite.user_id == user_id, Favorite.salon_id == salon_id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
        return True
    return False

async def get_user_favorites(db: AsyncSession, user_id: int) -> List[Favorite]:
    from app.models.salon import Salon
    stmt = select(Favorite).where(Favorite.user_id == user_id).options(
        selectinload(Favorite.salon).selectinload(Salon.services),
        selectinload(Favorite.salon).selectinload(Salon.staffs),
        selectinload(Favorite.salon).selectinload(Salon.reviews),
        selectinload(Favorite.salon).selectinload(Salon.images)
    )
    result = await db.execute(stmt)
    return list(result.scalars().unique().all())
