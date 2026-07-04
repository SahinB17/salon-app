from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.crud.crud_user import get_user_by_email, create_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    *,
    session: SessionDep,
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = await get_user_by_email(db=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await create_user(db=session, user_in=user_in)
    return user

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    return current_user
