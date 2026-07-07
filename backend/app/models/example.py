from pydantic import BaseModel, Field


class ExampleItemCreate(BaseModel):
    """Request body for creating an example item. Adjust per your feature."""

    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)


class ExampleItemOut(BaseModel):
    id: str
    name: str
    description: str | None = None
