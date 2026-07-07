from typing import Literal

from pydantic import BaseModel, Field

ComplaintCategory = Literal["pothole", "garbage", "water", "electricity", "other"]
ComplaintStatus = Literal["submitted", "in_review", "resolved"]


class ComplaintOut(BaseModel):
    id: str
    user_id: str
    description: str = Field(..., min_length=1)
    image_url: str | None = None
    category: ComplaintCategory
    status: ComplaintStatus
    created_at: str
