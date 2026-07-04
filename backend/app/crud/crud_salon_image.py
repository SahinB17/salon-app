from sqlalchemy.ext.asyncio import AsyncSession
from app.models.salon_image import SalonImage
from app.schemas.salon_image import SalonImageCreate

async def add_image_to_salon(db: AsyncSession, salon_id: int, image_url: str) -> SalonImage:
    db_image = SalonImage(salon_id=salon_id, image_url=image_url)
    db.add(db_image)
    await db.commit()
    await db.refresh(db_image)
    return db_image

async def remove_image_from_salon(db: AsyncSession, image_id: int) -> bool:
    from sqlalchemy.future import select
    stmt = select(SalonImage).where(SalonImage.id == image_id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
        return True
    return False
