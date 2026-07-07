import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "civic_services.json"


@lru_cache
def load_civic_services() -> list[dict[str, Any]]:
    with DATA_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def _service_map() -> dict[str, dict[str, Any]]:
    return {service["name"]: service for service in load_civic_services()}


def get_service(name: str | None) -> dict[str, Any] | None:
    if not name:
        return None
    return _service_map().get(name)


def get_application_form_url(name: str | None) -> str | None:
    service = get_service(name)
    if not service:
        return None
    return service.get("application_form_url")


def get_required_documents(name: str | None) -> list[str]:
    service = get_service(name)
    if not service:
        return []
    return [str(item) for item in service.get("document_checklist", [])]


SERVICE_NAMES = [service["name"] for service in load_civic_services()]
DOCUMENT_CHECKLISTS = {
    service["name"]: service["document_checklist"] for service in load_civic_services()
}
