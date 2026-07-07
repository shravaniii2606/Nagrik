from fastapi import HTTPException, status

from app.db.supabase_client import get_supabase
from app.models.profile import ProfileIn, ProfileOut


def _profile_from_row(row: dict) -> ProfileOut:
    return ProfileOut(
        id=str(row["id"]),
        name=row["name"],
        language_pref=row.get("language_pref", "English"),
        location=row.get("location"),
    )


def get_profile(user_id: str) -> ProfileOut | None:
    response = (
        get_supabase()
        .table("users")
        .select("id,name,language_pref,location")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
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
        "language_pref": payload.language_pref,
        "location": payload.location,
    }
    response = (
        get_supabase()
        .table("users")
        .upsert(row)
        .execute()
    )
    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Profile could not be saved.",
        )
    return _profile_from_row(rows[0])
