from fastapi import HTTPException, status

from app.db.supabase_client import get_supabase


def upload_private_file(
    bucket_name: str,
    path: str,
    content: bytes,
    content_type: str,
) -> str:
    try:
        get_supabase().storage.from_(bucket_name).upload(
            path=path,
            file=content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not upload file to storage.",
        ) from exc
    return f"{bucket_name}/{path}"


def create_signed_file_url(stored_path: str | None, expires_in: int = 3600) -> str | None:
    if not stored_path:
        return None

    bucket_name, _, object_path = stored_path.partition("/")
    if not bucket_name or not object_path:
        return None

    try:
        response = get_supabase().storage.from_(bucket_name).create_signed_url(
            object_path,
            expires_in,
        )
    except Exception:
        return None

    if isinstance(response, dict):
        return response.get("signedURL") or response.get("signed_url")
    return getattr(response, "signed_url", None)
