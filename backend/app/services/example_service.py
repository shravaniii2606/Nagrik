from app.models.example import ExampleItemCreate, ExampleItemOut
from app.core.security import sanitize_text

# In-memory placeholder store so the starter runs with zero setup.
# Swap this out for real Supabase calls once your schema is ready:
#   from app.db.supabase_client import get_supabase
_FAKE_DB: list[dict] = []


def create_example_item(payload: ExampleItemCreate) -> ExampleItemOut:
    item = {
        "id": str(len(_FAKE_DB) + 1),
        "name": sanitize_text(payload.name),
        "description": sanitize_text(payload.description) if payload.description else None,
    }
    _FAKE_DB.append(item)
    return ExampleItemOut(**item)


def list_example_items() -> list[ExampleItemOut]:
    return [ExampleItemOut(**item) for item in _FAKE_DB]
