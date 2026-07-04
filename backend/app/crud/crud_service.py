from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate

async def get_service(db: AsyncSession, service_id: int) -> Optional[Service]:
    result = await db.execute(select(Service).where(Service.id == service_id))
    return result.scalar_one_or_none()

async def get_services_by_salon(db: AsyncSession, salon_id: int, skip: int = 0, limit: int = 100) -> List[Service]:
    result = await db.execute(select(Service).where(Service.salon_id == salon_id).offset(skip).limit(limit))
    return list(result.scalars().all())

async def create_service(db: AsyncSession, service_in: ServiceCreate) -> Service:
    db_service = Service(
        salon_id=service_in.salon_id,
        name=service_in.name,
        description=service_in.description,
        price=service_in.price,
        duration_minutes=service_in.duration_minutes
    )
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service

async def update_service(db: AsyncSession, db_service: Service, service_in: ServiceUpdate) -> Service:
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service

async def delete_service(db: AsyncSession, service_id: int) -> bool:
    service = await get_service(db, service_id=service_id)
    if service:
        await db.delete(service)
        await db.commit()
        return True
    return False
