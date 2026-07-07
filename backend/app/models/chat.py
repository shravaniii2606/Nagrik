from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.security import require_sanitized_text

ChatIntent = Literal["document_checklist", "simple_qna", "service_recommendation"]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    service_context: str | None = Field(default=None, max_length=120)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        return require_sanitized_text(value, "message", max_length=1000)

    @field_validator("service_context")
    @classmethod
    def validate_service_context(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return require_sanitized_text(value, "service_context", max_length=120)


class ChecklistItem(BaseModel):
    label: str = Field(..., min_length=1, max_length=160)
    note: str | None = Field(default=None, max_length=240)


class ChatResponse(BaseModel):
    intent: ChatIntent
    answer: str = Field(..., min_length=1, max_length=1800)
    checklist: list[ChecklistItem] = Field(default_factory=list)
    application_form_url: str | None = Field(default=None, max_length=500)
    recommended_services: list[str] = Field(default_factory=list, max_length=5)


class DocumentUploadResponse(BaseModel):
    file_path: str
    file_url: str | None = None
