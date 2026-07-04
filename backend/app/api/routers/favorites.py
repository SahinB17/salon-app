from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import SessionDep, get_current_active_user
from app.models.user import User
from app.schemas.favorite import FavoriteResponse, FavoriteCreate
from app.crud import crud_favorite, crud_salon

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("/me", response_model=List[FavoriteResponse])
async def read_user_favorites(
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user's favorite salons.
    """
    favorites = await crud_favorite.get_user_favorites(db=session, user_id=current_user.id)
    return favorites

@router.post("/{salon_id}", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_salon_to_favorites(
    salon_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Add a salon to favorites.
    """
    salon = await crud_salon.get_salon(db=session, salon_id=salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    favorite = await crud_favorite.add_favorite(db=session, user_id=current_user.id, salon_id=salon_id)
    # Reload with salon relationship
    favorites = await crud_favorite.get_user_favorites(db=session, user_id=current_user.id)
    for fav in favorites:
        if fav.salon_id == salon_id:
            return fav
    return favorite

@router.delete("/{salon_id}", status_code=status.HTTP_200_OK)
async def remove_salon_from_favorites(
    salon_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Remove a salon from favorites.
    """
    success = await crud_favorite.remove_favorite(db=session, user_id=current_user.id, salon_id=salon_id)
    if not success:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"status": "success"}
