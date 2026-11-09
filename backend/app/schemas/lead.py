
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)

    email: EmailStr | None = None

    source: str = "Website"
    project_id: int | None = None

    configuration: str | None = None

    budget_min: int | None = Field(default=None, ge=0)
    budget_max: int | None = Field(default=None, ge=0)

    requirements: str | None = None

    consent_whatsapp: bool = False


class LeadUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None

    source: str | None = None
    project_id: int | None = None

    configuration: str | None = None

    budget_min: int | None = None
    budget_max: int | None = None

    requirements: str | None = None

    status: str | None = None
    priority: str | None = None

    assigned_to_id: int | None = None

    consent_whatsapp: bool | None = None


class LeadResponse(BaseModel):
    id: int
    lead_code: str

    name: str
    phone: str
    email: EmailStr | None = None

    source: str | None = None
    project_id: int | None = None
    assigned_to_id: int | None = None

    configuration: str | None = None

    budget_min: int | None = None
    budget_max: int | None = None

    requirements: str | None = None

    status: str
    priority: str | None = None

    consent_whatsapp: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
