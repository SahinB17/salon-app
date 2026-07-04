from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserPasswordUpdate
from app.crud.crud_user import get_user_by_email, create_user, update_user, delete_user
from app.core.security import verify_password, get_password_hash

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

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    *,
    session: SessionDep,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update current user profile.
    Only allows updating full_name and phone.
    """
    # Prevent updating email for now as per requirements
    update_data = UserUpdate(
        full_name=user_in.full_name,
        phone=user_in.phone
    )
    user = await update_user(db=session, db_user=current_user, user_in=update_data)
    return user

@router.put("/me/password", response_model=UserResponse)
async def update_password_me(
    *,
    session: SessionDep,
    body: UserPasswordUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update current user password.
    """
    if not verify_password(body.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Cari şifrə yanlışdır.")
    
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_me(
    *,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> None:
    """
    Delete current user.
    """
    await delete_user(db=session, db_user=current_user)
