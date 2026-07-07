from fastapi import HTTPException, status
from postgrest.exceptions import APIError

from app.db.supabase_client import get_supabase
from app.models.profile import ProfileIn, ProfileOut

MISSING_PROFILE_COLUMNS_MESSAGE = (
    "Profile details columns are missing in Supabase. Run "
    "backend/app/db/profile_details_migration.sql in the Supabase SQL editor."
)


def _profile_from_row(row: dict) -> ProfileOut:
    return ProfileOut(
        id=str(row["id"]),
        name=row["name"],
        birth_date=row.get("birth_date"),
        gender=row.get("gender"),
        address=row.get("address"),
        city=row.get("city"),
        state=row.get("state"),
        pincode=row.get("pincode"),
        language_pref=row.get("language_pref", "English"),
        location=row.get("location"),
    )


def get_profile(user_id: str) -> ProfileOut | None:
    try:
        response = (
            get_supabase()
            .table("users")
            .select("id,name,birth_date,gender,address,city,state,pincode,language_pref,location")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )
    except APIError as exc:
        if exc.args and isinstance(exc.args[0], dict) and exc.args[0].get("code") == "42703":
            response = (
                get_supabase()
                .table("users")
                .select("id,name,language_pref,location")
                .eq("id", user_id)
                .limit(1)
                .execute()
            )
        else:
            raise

    rows = response.data or []
    if not rows:
        return None
    return _profile_from_row(rows[0])


def get_language_preference(user_id: str) -> str:
    profile = get_profile(user_id)
    return profile.language_pref if profile else "English"


def upsert_profile(user_id: str, payload: ProfileIn) -> ProfileOut:
    row = {
        "id": user_id,
        "name": payload.name,
        "birth_date": payload.birth_date.isoformat() if payload.birth_date else None,
        "gender": payload.gender,
        "address": payload.address,
        "city": payload.city,
        "state": payload.state,
        "pincode": payload.pincode,
        "language_pref": payload.language_pref,
        "location": payload.location,
    }
    try:
        response = (
            get_supabase()
            .table("users")
            .upsert(row)
            .execute()
        )
    except APIError as exc:
        if exc.args and isinstance(exc.args[0], dict) and exc.args[0].get("code") == "42703":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=MISSING_PROFILE_COLUMNS_MESSAGE,
            ) from exc
        raise
    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Profile could not be saved.",
        )
    return _profile_from_row(rows[0])
