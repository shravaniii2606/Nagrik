from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.security import require_sanitized_text

LanguagePreference = Literal["English", "Hindi", "Marathi"]


class ProfileIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    language_pref: LanguagePreference = "English"
    location: str | None = Field(default=None, max_length=160)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return require_sanitized_text(value, "name", max_length=120)

    @field_validator("location")
    @classmethod
    def validate_location(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        return require_sanitized_text(value, "location", max_length=160)


class ProfileOut(BaseModel):
    id: str
    name: str
    language_pref: LanguagePreference
    location: str | None = None
