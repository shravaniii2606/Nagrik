import html
import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
}

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_SPACE_RE = re.compile(r"\s+")


def sanitize_text(value: str, max_length: int = 1000) -> str:
    cleaned = _CONTROL_CHARS_RE.sub("", value)
    cleaned = _SPACE_RE.sub(" ", cleaned).strip()
    return html.escape(cleaned[:max_length], quote=True)


def require_sanitized_text(
    value: str,
    field_name: str,
    min_length: int = 1,
    max_length: int = 1000,
) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be text")

    cleaned = sanitize_text(value, max_length=max_length)
    if len(cleaned) < min_length:
        raise ValueError(f"{field_name} is required")
    return cleaned


def validate_image_metadata(file: UploadFile) -> str:
    content_type = (file.content_type or "").lower()
    extension = Path(file.filename or "").suffix.lower()
    allowed_extensions = ALLOWED_IMAGE_TYPES.get(content_type)
    if not allowed_extensions or extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG and PNG images are allowed.",
        )
    return ".jpg" if content_type == "image/jpeg" else ".png"


async def read_validated_image(file: UploadFile) -> tuple[bytes, str, str]:
    extension = validate_image_metadata(file)
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty.",
        )
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded image must be 5MB or smaller.",
        )
    if extension == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PNG image content is invalid.",
        )
    if extension == ".jpg" and not content.startswith(b"\xff\xd8\xff"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JPG image content is invalid.",
        )
    return content, file.content_type or "application/octet-stream", extension


def build_user_storage_path(user_id: str, extension: str) -> str:
    return f"{user_id}/{uuid4().hex}{extension}"
