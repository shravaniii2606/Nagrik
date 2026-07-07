from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.security import require_sanitized_text

ApplicationStatus = Literal["in_progress", "under_process", "resolved"]


class ApplicationDocument(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    file_path: str | None = Field(default=None, max_length=1000)
    file_url: str | None = Field(default=None, max_length=1000)
    uploaded: bool = False

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return require_sanitized_text(value, "document name", max_length=160)

    @field_validator("file_path")
    @classmethod
    def validate_file_path(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        cleaned_url = value.strip()[:1000]
        if any(ord(character) < 32 or ord(character) == 127 for character in cleaned_url):
            raise ValueError("file_path contains invalid characters")
        return cleaned_url

    @field_validator("file_url")
    @classmethod
    def validate_file_url(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        cleaned_url = value.strip()[:1000]
        if not cleaned_url.startswith("https://"):
            raise ValueError("file_url must be an HTTPS URL")
        if any(ord(character) < 32 or ord(character) == 127 for character in cleaned_url):
            raise ValueError("file_url contains invalid characters")
        return cleaned_url


class ApplicationCreate(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=120)
    documents: list[ApplicationDocument] = Field(..., min_length=1, max_length=20)

    @field_validator("service_name")
    @classmethod
    def validate_service_name(cls, value: str) -> str:
        return require_sanitized_text(value, "service_name", max_length=120)


class ApplicationOut(BaseModel):
    id: str
    user_id: str
    service_name: str
    status: ApplicationStatus
    documents: list[ApplicationDocument]
    created_at: str
    updated_at: str
