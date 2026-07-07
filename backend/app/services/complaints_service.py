from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.security import build_user_storage_path, read_validated_image
from app.db.supabase_client import get_supabase
from app.models.complaints import ComplaintOut
from app.services.llm_service import classify_complaint_category
from app.services.storage_service import create_signed_file_url, upload_private_file


def _complaint_from_row(row: dict) -> ComplaintOut:
    return ComplaintOut(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        description=row["description"],
        image_url=create_signed_file_url(row.get("image_url")),
        category=row["category"],
        status=row["status"],
        created_at=str(row["created_at"]),
    )


async def create_complaint(
    user_id: str,
    description: str,
    image: UploadFile | None,
) -> ComplaintOut:
    category = await classify_complaint_category(description)
    image_path = None

    if image and image.filename:
        content, content_type, extension = await read_validated_image(image)
        storage_path = build_user_storage_path(user_id, extension)
        image_path = upload_private_file(
            settings.complaint_image_bucket,
            storage_path,
            content,
            content_type,
        )

    response = (
        get_supabase()
        .table("complaints")
        .insert(
            {
                "user_id": user_id,
                "description": description,
                "image_url": image_path,
                "category": category,
                "status": "submitted",
            }
        )
        .execute()
    )
    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Complaint could not be saved.",
        )
    return _complaint_from_row(rows[0])


def list_user_complaints(user_id: str) -> list[ComplaintOut]:
    response = (
        get_supabase()
        .table("complaints")
        .select("id,user_id,description,image_url,category,status,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [_complaint_from_row(row) for row in response.data or []]
