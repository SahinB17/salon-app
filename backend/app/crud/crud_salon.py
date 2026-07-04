from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.salon import Salon
from app.schemas.salon import SalonCreate, SalonUpdate

async def get_salon(db: AsyncSession, salon_id: int) -> Optional[Salon]:
    stmt = select(Salon).where(Salon.id == salon_id).options(
        selectinload(Salon.services),
        selectinload(Salon.staffs)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_salons(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Salon]:
    stmt = select(Salon).offset(skip).limit(limit).options(
        selectinload(Salon.services),
        selectinload(Salon.staffs)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def create_salon(db: AsyncSession, salon_in: SalonCreate) -> Salon:
    db_salon = Salon(
        owner_id=salon_in.owner_id,
        name=salon_in.name,
        address=salon_in.address,
        description=salon_in.description,
        contact_phone=salon_in.contact_phone
    )
    db.add(db_salon)
    await db.commit()
    await db.refresh(db_salon)
    return db_salon

async def update_salon(db: AsyncSession, db_salon: Salon, salon_in: SalonUpdate) -> Salon:
    update_data = salon_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_salon, field, value)
    
    db.add(db_salon)
    await db.commit()
    await db.refresh(db_salon)
    return db_salon

async def delete_salon(db: AsyncSession, salon_id: int) -> bool:
    salon = await get_salon(db, salon_id=salon_id)
    if salon:
        await db.delete(salon)
        await db.commit()
        return True
    return False
