from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from app.core.auth import CurrentUser, get_current_user
from app.core.rate_limit import limiter
from app.core.security import require_sanitized_text
from app.models.complaints import ComplaintOut
from app.services.complaints_service import create_complaint, list_user_complaints

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.get("", response_model=list[ComplaintOut])
def get_complaints(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> list[ComplaintOut]:
    return list_user_complaints(current_user.id)


@router.post("", response_model=ComplaintOut)
@limiter.limit("6/minute")
async def submit_complaint(
    request: Request,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    description: Annotated[str, Form(..., min_length=10, max_length=1000)],
    image: Annotated[UploadFile | None, File()] = None,
) -> ComplaintOut:
    try:
        sanitized_description = require_sanitized_text(
            description,
            "description",
            min_length=10,
            max_length=1000,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    return await create_complaint(current_user.id, sanitized_description, image)
