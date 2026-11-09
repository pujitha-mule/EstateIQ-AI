
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BookingCreate(BaseModel):
    lead_id: int
    project_id: int

    slot_id: int | None = None
    slot_start: datetime | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_slot(self):
        if self.slot_id is None and self.slot_start is None:
            raise ValueError("Provide either slot_id or slot_start")
        return self


class BookingResponse(BaseModel):
    id: int
    lead_id: int
    project_id: int
    executive_id: int | None = None
    slot_id: int | None = None

    slot_start: datetime
    slot_end: datetime

    status: str
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AvailableSlot(BaseModel):
    id: int
    project_id: int
    starts_at: datetime
    start: datetime
    end: datetime
    available: bool = True
