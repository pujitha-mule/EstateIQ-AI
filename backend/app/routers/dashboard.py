
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.lead import Lead
from app.models.booking import Booking
from app.models.chat import Handoff
from app.models.user import User


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_leads = db.query(
        func.count(Lead.id)
    ).scalar() or 0

    total_bookings = db.query(
        func.count(Booking.id)
    ).filter(
        Booking.status == "confirmed"
    ).scalar() or 0

    pending_handoffs = db.query(
        func.count(Handoff.id)
    ).filter(
        Handoff.status == "pending"
    ).scalar() or 0

    today = datetime.now(timezone.utc).date()

    today_start = datetime.combine(
        today,
        datetime.min.time(),
        tzinfo=timezone.utc,
    )

    tomorrow_start = today_start + timedelta(days=1)

    visits_today = db.query(
        func.count(Booking.id)
    ).filter(
        Booking.status == "confirmed",
        Booking.slot_start >= today_start,
        Booking.slot_start < tomorrow_start,
    ).scalar() or 0

    booked_leads = db.query(
        func.count(func.distinct(Booking.lead_id))
    ).filter(
        Booking.status == "confirmed"
    ).scalar() or 0

    conversion_rate = (
        round(booked_leads / total_leads * 100, 2)
        if total_leads else 0
    )

    status_rows = db.query(
        Lead.status,
        func.count(Lead.id),
    ).group_by(Lead.status).all()

    source_rows = db.query(
        Lead.source,
        func.count(Lead.id),
    ).group_by(Lead.source).all()

    recent_leads = db.query(
        Lead
    ).order_by(
        Lead.created_at.desc()
    ).limit(5).all()

    return {
        "total_leads": total_leads,
        "total_bookings": total_bookings,
        "visits_booked": total_bookings,
        "visits_today": visits_today,
        "handoffs": pending_handoffs,
        "conversion_rate": conversion_rate,

        # Not measured yet. Do not present an invented metric.
        "avg_response_time": None,

        "status_breakdown": [
            {
                "status": status,
                "count": count,
            }
            for status, count in status_rows
        ],

        "leads_by_source": [
            {
                "source": source or "Unknown",
                "count": count,
            }
            for source, count in source_rows
        ],

        "recent_leads": [
            {
                "id": lead.id,
                "lead_code": lead.lead_code,
                "name": lead.name,
                "phone": lead.phone,
                "source": lead.source,
                "status": lead.status,
                "created_at": lead.created_at,
            }
            for lead in recent_leads
        ],
    }
