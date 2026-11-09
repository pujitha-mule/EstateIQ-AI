
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    lead_id: int

    message: str = Field(
        min_length=1,
        max_length=4000,
    )

    language: str = "en"


class ChatResponse(BaseModel):
    id: int
    lead_id: int

    sender: str
    message: str
    language: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoffRequest(BaseModel):
    lead_id: int

    executive: str | None = None
    summary: str | None = None
