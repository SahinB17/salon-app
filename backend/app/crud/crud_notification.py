from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

async def create_notification(db: AsyncSession, notification_in: NotificationCreate) -> Notification:
    db_obj = Notification(
        user_id=notification_in.user_id,
        title=notification_in.title,
        message=notification_in.message,
        is_read=False
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_user_notifications(db: AsyncSession, user_id: int, limit: int = 50) -> List[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())

async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
    )
    db_obj = result.scalar_one_or_none()
    if db_obj:
        db_obj.is_read = True
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
    return db_obj

async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    )
    unread = result.scalars().all()
    for n in unread:
        n.is_read = True
        db.add(n)
    if unread:
        await db.commit()
    return len(unread)
