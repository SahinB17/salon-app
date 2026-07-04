from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate

async def get_staff(db: AsyncSession, staff_id: int) -> Optional[Staff]:
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    return result.scalar_one_or_none()

async def get_staff_by_salon(db: AsyncSession, salon_id: int, skip: int = 0, limit: int = 100) -> List[Staff]:
    result = await db.execute(select(Staff).where(Staff.salon_id == salon_id).offset(skip).limit(limit))
    return list(result.scalars().all())

async def create_staff(db: AsyncSession, staff_in: StaffCreate) -> Staff:
    db_staff = Staff(**staff_in.model_dump())
    db.add(db_staff)
    await db.commit()
    await db.refresh(db_staff)
    return db_staff

async def update_staff(db: AsyncSession, db_staff: Staff, staff_in: StaffUpdate) -> Staff:
    update_data = staff_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_staff, field, value)
    
    db.add(db_staff)
    await db.commit()
    await db.refresh(db_staff)
    return db_staff

async def delete_staff(db: AsyncSession, staff_id: int) -> bool:
    staff = await get_staff(db, staff_id=staff_id)
    if staff:
        await db.delete(staff)
        await db.commit()
        return True
    return False
