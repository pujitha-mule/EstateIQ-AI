
from datetime import date, datetime, time, timedelta, timezone
from threading import Lock

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.booking import Booking, VisitSlot, Reminder
from app.models.lead import Lead
from app.models.project import Project
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse


router = APIRouter(tags=["Bookings"])

# Protects booking operations inside this application process.
# PostgreSQL deployments should also use database row locking.
BOOKING_LOCK = Lock()


# ---------------------------------------------------------
# DATETIME HELPERS
# ---------------------------------------------------------

def utc_now_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_utc_naive(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value

    return value.astimezone(timezone.utc).replace(tzinfo=None)


def iso_datetime(value):
    if value is None:
        return None

    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc)

    return value.isoformat()


# ---------------------------------------------------------
# AVAILABLE VISIT SLOTS
# ---------------------------------------------------------

@router.get("/slots")
def get_slots(
    project_id: int,
    visit_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.is_active.is_(True),
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    selected_date = visit_date or datetime.now(timezone.utc).date()

    start = datetime.combine(selected_date, time.min)
    end = start + timedelta(days=1)
    now = utc_now_naive()

    slots = (
        db.query(VisitSlot)
        .filter(
            VisitSlot.project_id == project_id,
            VisitSlot.starts_at >= start,
            VisitSlot.starts_at < end,
            VisitSlot.starts_at > now,
        )
        .order_by(VisitSlot.starts_at.asc())
        .all()
    )

    results = []

    for slot in slots:
        confirmed_count = (
            db.query(Booking)
            .filter(
                Booking.slot_id == slot.id,
                Booking.status == "confirmed",
            )
            .count()
        )

        capacity = max(int(slot.capacity or 1), 1)
        available_count = max(capacity - confirmed_count, 0)

        slot_start = to_utc_naive(slot.starts_at)
        slot_end = slot_start + timedelta(hours=1)

        results.append({
            "id": slot.id,
            "project_id": slot.project_id,
            "starts_at": iso_datetime(slot_start),
            "start": iso_datetime(slot_start),
            "end": iso_datetime(slot_end),
            "duration_minutes": 60,
            "capacity": capacity,
            "booked_count": confirmed_count,
            "available_count": available_count,
            "available": available_count > 0,
        })

    return results


# ---------------------------------------------------------
# GET ALL BOOKINGS
# ---------------------------------------------------------

@router.get(
    "/bookings",
    response_model=list[BookingResponse],
)
def get_bookings(
    visit_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Booking)

    if visit_date:
        start = datetime.combine(visit_date, time.min)
        end = start + timedelta(days=1)

        query = query.filter(
            Booking.slot_start >= start,
            Booking.slot_start < end,
        )

    return query.order_by(Booking.slot_start.asc()).all()


# ---------------------------------------------------------
# CREATE BOOKING
# ---------------------------------------------------------

@router.post(
    "/bookings",
    response_model=BookingResponse,
    status_code=201,
)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    with BOOKING_LOCK:
        try:
            # 1. Find lead
            lead = (
                db.query(Lead)
                .filter(Lead.id == payload.lead_id)
                .first()
            )

            if not lead:
                raise HTTPException(
                    status_code=404,
                    detail="Lead not found.",
                )

            # 2. Validate project
            project_id = payload.project_id or lead.project_id

            project = (
                db.query(Project)
                .filter(
                    Project.id == project_id,
                    Project.is_active.is_(True),
                )
                .first()
            )

            if not project:
                raise HTTPException(
                    status_code=404,
                    detail="Project not found.",
                )

            if lead.project_id and lead.project_id != project.id:
                raise HTTPException(
                    status_code=400,
                    detail="The selected project does not match the lead.",
                )

            # 3. Find requested slot
            if payload.slot_id is not None:
                slot_query = db.query(VisitSlot).filter(
                    VisitSlot.id == payload.slot_id,
                    VisitSlot.project_id == project.id,
                )
            else:
                requested_start = to_utc_naive(payload.slot_start)

                slot_query = db.query(VisitSlot).filter(
                    VisitSlot.project_id == project.id,
                    VisitSlot.starts_at == requested_start,
                )

            # PostgreSQL can lock the selected slot row.
            slot = slot_query.with_for_update().first()

            if not slot:
                raise HTTPException(
                    status_code=404,
                    detail="Visit slot not found.",
                )

            # 4. Reject past appointments
            start = to_utc_naive(slot.starts_at)
            now = utc_now_naive()

            if start <= now:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot book a past appointment.",
                )

            # 5. Allow only one confirmed booking per lead
            existing_booking = (
                db.query(Booking)
                .filter(
                    Booking.lead_id == lead.id,
                    Booking.status == "confirmed",
                )
                .first()
            )

            if existing_booking:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "This buyer already has a confirmed visit. "
                        "Cancel the existing booking before creating another."
                    ),
                )

            # 6. Check slot capacity
            confirmed_count = (
                db.query(Booking)
                .filter(
                    Booking.slot_id == slot.id,
                    Booking.status == "confirmed",
                )
                .count()
            )

            capacity = max(int(slot.capacity or 1), 1)

            if confirmed_count >= capacity:
                raise HTTPException(
                    status_code=409,
                    detail="This appointment slot is already full.",
                )

            # 7. Create booking
            booking = Booking(
                lead_id=lead.id,
                project_id=project.id,
                executive_id=current_user.id,
                slot_id=slot.id,
                slot_start=start,
                slot_end=start + timedelta(hours=1),
                status="confirmed",
                notes=payload.notes,
            )

            db.add(booking)
            db.flush()

            # 8. Create simulated reminders
            for hours_before in (24, 2):
                reminder_time = start - timedelta(hours=hours_before)

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

            # 9. Update lead
            lead.status = "booked"

            db.commit()
            db.refresh(booking)

            return booking

        except HTTPException:
            db.rollback()
            raise

        except IntegrityError:
            db.rollback()

            raise HTTPException(
                status_code=409,
                detail="Booking could not be completed because of a database conflict.",
            )

        except Exception:
            db.rollback()
            raise


# ---------------------------------------------------------
# CANCEL BOOKING
# ---------------------------------------------------------

@router.patch("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    with BOOKING_LOCK:
        booking = (
            db.query(Booking)
            .filter(Booking.id == booking_id)
            .first()
        )

        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found.",
            )

        if booking.status != "confirmed":
            raise HTTPException(
                status_code=400,
                detail="Only confirmed bookings can be cancelled.",
            )

        try:
            booking.status = "cancelled"

            # Cancel reminders that have not yet been sent.
            db.query(Reminder).filter(
                Reminder.booking_id == booking.id,
                Reminder.status == "pending",
            ).update(
                {"status": "cancelled"},
                synchronize_session=False,
            )

            db.commit()

            return {
                "success": True,
                "booking_id": booking.id,
                "status": "cancelled",
                "message": "Booking and pending reminders cancelled.",
            }

        except Exception:
            db.rollback()
            raise
