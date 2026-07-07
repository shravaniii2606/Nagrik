from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.core.auth import CurrentUser, get_current_user
from app.models.applications import ApplicationCreate, ApplicationOut
from app.services.application_service import create_application, list_applications

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationOut])
def get_applications(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service_name: Annotated[str | None, Query(max_length=120)] = None,
) -> list[ApplicationOut]:
    return list_applications(current_user.id, service_name)


@router.post("", response_model=ApplicationOut)
def submit_application(
    payload: ApplicationCreate,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ApplicationOut:
    return create_application(current_user.id, payload)
