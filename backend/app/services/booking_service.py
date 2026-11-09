
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking, VisitSlot, Reminder
from app.models.lead import Lead
from app.models.project import Project


def get_available_slots(
    db: Session,
    project_id: int,
    visit_date,
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.is_active.is_(True),
    ).first()

    if not project:
        raise HTTPException(404, "Project not found.")

    slots = db.query(VisitSlot).filter(
        VisitSlot.project_id == project_id,
    ).order_by(
        VisitSlot.starts_at.asc()
    ).all()

    results = []

    for slot in slots:
        if visit_date and slot.starts_at.date() != visit_date:
            continue

        booked_count = db.query(Booking).filter(
            Booking.slot_id == slot.id,
            Booking.status == "confirmed",
        ).count()

        results.append({
            "id": slot.id,
            "project_id": slot.project_id,
            "starts_at": slot.starts_at,
            "start": slot.starts_at,
            "end": slot.starts_at + timedelta(hours=1),
            "available": booked_count < slot.capacity,
        })

    return results


def create_booking(
    db: Session,
    lead_id: int,
    slot_id: int,
    executive_id: int | None = None,
    notes: str | None = None,
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(404, "Lead not found.")

    slot = db.query(VisitSlot).filter(
        VisitSlot.id == slot_id
    ).with_for_update().first()

    if not slot:
        raise HTTPException(404, "Visit slot not found.")

    if lead.project_id and lead.project_id != slot.project_id:
        raise HTTPException(
            400,
            "The visit slot does not match the lead's project.",
        )

    now = datetime.now(timezone.utc)

    slot_time = slot.starts_at

    if slot_time.tzinfo is None:
        slot_time = slot_time.replace(tzinfo=timezone.utc)

    if slot_time <= now:
        raise HTTPException(
            400,
            "Cannot book a past appointment.",
        )

    booked_count = db.query(Booking).filter(
        Booking.slot_id == slot.id,
        Booking.status == "confirmed",
    ).count()

    if booked_count >= slot.capacity:
        raise HTTPException(
            409,
            "This appointment slot is already full.",
        )

    booking = Booking(
        lead_id=lead.id,
        project_id=slot.project_id,
        executive_id=executive_id,
        slot_id=slot.id,
        slot_start=slot_time,
        slot_end=slot_time + timedelta(hours=1),
        status="confirmed",
        notes=notes,
    )

    try:
        db.add(booking)
        db.flush()

        for hours_before in (24, 2):
            reminder_time = slot_time - timedelta(hours=hours_before)

            if reminder_time > now:
                db.add(
                    Reminder(
                        booking_id=booking.id,
                        send_at=reminder_time,
                        channel="Mock_SMS",
                        status="pending",
                        message_type=f"{hours_before}h",
                    )
                )

        lead.status = "booked"

        db.commit()
        db.refresh(booking)

        return booking

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            409,
            "This appointment slot was booked by another user.",
        )
    except Exception:
        db.rollback()
        raise
