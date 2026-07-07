from typing import Annotated

from fastapi import APIRouter, Depends, File, Request, UploadFile

from app.core.auth import CurrentUser, get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import build_user_storage_path, read_validated_image
from app.models.chat import ChatRequest, ChatResponse, DocumentUploadResponse
from app.services import profile_service
from app.services.llm_service import generate_chat_response
from app.services.storage_service import create_signed_file_url, upload_private_file

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("12/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ChatResponse:
    language_pref = profile_service.get_language_preference(current_user.id)
    return await generate_chat_response(
        payload.message,
        payload.service_context,
        language_pref,
    )


@router.post("/document-upload", response_model=DocumentUploadResponse)
async def upload_checklist_document(
    file: Annotated[UploadFile, File(...)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> DocumentUploadResponse:
    content, content_type, extension = await read_validated_image(file)
    storage_path = build_user_storage_path(current_user.id, extension)
    stored_path = upload_private_file(
        settings.document_upload_bucket,
        storage_path,
        content,
        content_type,
    )
    return DocumentUploadResponse(
        file_path=stored_path,
        file_url=create_signed_file_url(stored_path),
    )
