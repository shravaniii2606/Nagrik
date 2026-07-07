from fastapi import HTTPException, status
from postgrest.exceptions import APIError

from app.core.config import settings
from app.core.security import require_sanitized_text
from app.db.supabase_client import get_supabase
from app.models.applications import ApplicationCreate, ApplicationDocument, ApplicationOut
from app.services.civic_services import get_required_documents, get_service
from app.services.storage_service import create_signed_file_url

MISSING_APPLICATIONS_TABLE_MESSAGE = (
    "Applications table is missing in Supabase. Run "
    "backend/app/db/applications_migration.sql in the Supabase SQL editor."
)


def _application_from_row(row: dict) -> ApplicationOut:
    return ApplicationOut(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        service_name=row["service_name"],
        status=row["status"],
        documents=[
            ApplicationDocument(
                name=document.get("name", ""),
                file_path=document.get("file_path"),
                file_url=create_signed_file_url(document.get("file_path"))
                or document.get("file_url"),
                uploaded=bool(document.get("uploaded")),
            )
            for document in row.get("documents", [])
        ],
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
    )


def _raise_missing_table_if_needed(exc: APIError) -> None:
    if exc.args and isinstance(exc.args[0], dict) and exc.args[0].get("code") in {"42P01", "42703"}:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=MISSING_APPLICATIONS_TABLE_MESSAGE,
        ) from exc
    raise exc


def _validate_service(service_name: str) -> None:
    if not get_service(service_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown government service.",
        )


def _validate_complete_documents(
    user_id: str,
    service_name: str,
    documents: list[ApplicationDocument],
) -> list[dict]:
    required_documents = get_required_documents(service_name)
    if not required_documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No required document checklist found for this service.",
        )

    documents_by_name = {document.name: document for document in documents}
    required_path_prefix = f"{settings.document_upload_bucket}/{user_id}/"
    missing_documents = [
        document_name
        for document_name in required_documents
        if document_name not in documents_by_name
        or not documents_by_name[document_name].uploaded
        or not documents_by_name[document_name].file_path
    ]
    if missing_documents:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Upload all required documents before submitting: {', '.join(missing_documents)}",
        )

    invalid_paths = [
        document_name
        for document_name in required_documents
        if not documents_by_name[document_name].file_path.startswith(required_path_prefix)
    ]
    if invalid_paths:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Documents must be uploaded from the signed-in user's account.",
        )

    return [
        {
            "name": document_name,
            "file_path": documents_by_name[document_name].file_path,
            "uploaded": True,
        }
        for document_name in required_documents
    ]


def list_applications(user_id: str, service_name: str | None = None) -> list[ApplicationOut]:
    sanitized_service_name = (
        require_sanitized_text(service_name, "service_name", max_length=120)
        if service_name
        else None
    )
    query = (
        get_supabase()
        .table("applications")
        .select("id,user_id,service_name,status,documents,created_at,updated_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )
    if sanitized_service_name:
        _validate_service(sanitized_service_name)
        query = query.eq("service_name", sanitized_service_name)

    try:
        response = query.execute()
    except APIError as exc:
        _raise_missing_table_if_needed(exc)

    return [_application_from_row(row) for row in response.data or []]


def create_application(user_id: str, payload: ApplicationCreate) -> ApplicationOut:
    _validate_service(payload.service_name)
    documents = _validate_complete_documents(user_id, payload.service_name, payload.documents)

    existing_applications = list_applications(user_id, payload.service_name)
    if existing_applications:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An application already exists for this service.",
        )

    try:
        response = (
            get_supabase()
            .table("applications")
            .insert(
                {
                    "user_id": user_id,
                    "service_name": payload.service_name,
                    "status": "under_process",
                    "documents": documents,
                }
            )
            .execute()
        )
    except APIError as exc:
        _raise_missing_table_if_needed(exc)

    rows = response.data or []
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Application could not be saved.",
        )
    return _application_from_row(rows[0])
