
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.lead import Lead
from app.models.project import Project
from app.models.consent import Consent
from app.models.user import User
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
)


router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


@router.get("", response_model=list[LeadResponse])
def get_leads(
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Lead)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (Lead.name.ilike(term))
            | (Lead.phone.ilike(term))
            | (Lead.lead_code.ilike(term))
        )

    if status and status.lower() != "all":
        query = query.filter(Lead.status == status)

    return query.order_by(
        Lead.created_at.desc()
    ).all()


@router.post(
    "",
    response_model=LeadResponse,
    status_code=201,
)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    phone = payload.phone.strip()

    duplicate = db.query(Lead).filter(
        Lead.phone == phone
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=f"Lead already exists: {duplicate.lead_code}",
        )

    if payload.project_id:
        project = db.query(Project).filter(
            Project.id == payload.project_id,
            Project.is_active.is_(True),
        ).first()

        if not project:
            raise HTTPException(404, "Project not found.")

    lead = Lead(
        lead_code=f"LD-{uuid.uuid4().hex[:8].upper()}",
        name=payload.name.strip(),
        phone=phone,
        email=str(payload.email).lower() if payload.email else None,
        source=payload.source,
        project_id=payload.project_id,
        configuration=payload.configuration,
        budget_min=payload.budget_min,
        budget_max=payload.budget_max,
        requirements=payload.requirements,
        status="new",
        priority="normal",
        consent_whatsapp=payload.consent_whatsapp,
        consent_recorded_at=(
            datetime.now(timezone.utc)
            if payload.consent_whatsapp
            else None
        ),
    )

    try:
        db.add(lead)
        db.flush()

        if payload.consent_whatsapp:
            db.add(
                Consent(
                    lead_id=lead.id,
                    channel="WhatsApp",
                    purpose="WhatsApp communication",
                    granted=True,
                    evidence="Consent recorded during lead creation.",
                )
            )

        db.commit()
        db.refresh(lead)

    except Exception:
        db.rollback()
        raise

    return lead


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    updates = payload.model_dump(exclude_unset=True)

    if updates.get("phone"):
        updates["phone"] = updates["phone"].strip()

        duplicate = db.query(Lead).filter(
            Lead.phone == updates["phone"],
            Lead.id != lead_id,
        ).first()

        if duplicate:
            raise HTTPException(
                409,
                "This phone number already belongs to another lead.",
            )

    if "consent_whatsapp" in updates:
        granted = updates["consent_whatsapp"]

        lead.consent_recorded_at = (
            datetime.now(timezone.utc) if granted else None
        )

        db.add(
            Consent(
                lead_id=lead.id,
                channel="WhatsApp",
                purpose="WhatsApp communication",
                granted=granted,
                evidence="Consent updated through lead management.",
            )
        )

    for field, value in updates.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)

    return lead
