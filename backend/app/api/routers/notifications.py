from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.crud import crud_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def read_user_notifications(
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve logged-in user's notifications.
    """
    return await crud_notification.get_user_notifications(db=session, user_id=current_user.id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mark a notification as read.
    """
    notification = await crud_notification.mark_as_read(
        db=session, notification_id=notification_id, user_id=current_user.id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/read-all")
async def read_all_notifications(
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mark all notifications of current user as read.
    """
    count = await crud_notification.mark_all_as_read(db=session, user_id=current_user.id)
    return {"status": "success", "marked_read_count": count}
