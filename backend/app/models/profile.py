from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.security import require_sanitized_text

LanguagePreference = Literal["English", "Hindi", "Marathi"]
Gender = Literal["Female", "Male", "Non-binary", "Prefer not to say"]


class ProfileIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    birth_date: date | None = None
    gender: Gender | None = None
    address: str | None = Field(default=None, max_length=240)
    city: str | None = Field(default=None, max_length=120)
    state: str | None = Field(default=None, max_length=120)
    pincode: str | None = Field(default=None, pattern=r"^[1-9][0-9]{5}$")
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

    @field_validator("address")
    @classmethod
    def validate_address(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        return require_sanitized_text(value, "address", max_length=240)

    @field_validator("city", "state")
    @classmethod
    def validate_short_text(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        return require_sanitized_text(value, "profile field", max_length=120)


class ProfileOut(BaseModel):
    id: str
    name: str
    birth_date: date | None = None
    gender: Gender | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    language_pref: LanguagePreference
    location: str | None = None
