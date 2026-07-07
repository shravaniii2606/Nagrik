from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.models.profile import ProfileIn, ProfileOut
from app.services.profile_service import get_profile, upsert_profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def read_profile(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ProfileOut:
    profile = get_profile(current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile has not been created yet.",
        )
    return profile


@router.put("", response_model=ProfileOut)
def save_profile(
    payload: ProfileIn,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ProfileOut:
    return upsert_profile(current_user.id, payload)
