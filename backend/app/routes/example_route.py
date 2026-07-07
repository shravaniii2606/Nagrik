from fastapi import APIRouter

from app.models.example import ExampleItemCreate, ExampleItemOut
from app.services import example_service

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("/", response_model=list[ExampleItemOut])
def get_items():
    return example_service.list_example_items()


@router.post("/", response_model=ExampleItemOut)
def create_item(payload: ExampleItemCreate):
    return example_service.create_example_item(payload)
