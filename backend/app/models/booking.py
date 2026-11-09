
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
)

from app.database import Base


class VisitSlot(Base):
    __tablename__ = "visit_slots"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    starts_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    capacity = Column(
        Integer,
        default=1,
        nullable=False,
    )


class Booking(Base):
    __tablename__ = "bookings"

    __table_args__ = (
        Index("ix_booking_lead", "lead_id"),
        Index("ix_booking_slot_status", "slot_id", "status"),
        Index("ix_booking_project_start", "project_id", "slot_start"),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    lead_id = Column(
        Integer,
        ForeignKey("leads.id"),
        nullable=False,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    executive_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    slot_id = Column(
        Integer,
        ForeignKey("visit_slots.id"),
        nullable=True,
    )

    slot_start = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    slot_end = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    status = Column(
        String(30),
        default="confirmed",
        nullable=False,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
    )

    send_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    channel = Column(
        String(30),
        default="Mock_SMS",
    )

    status = Column(
        String(30),
        default="pending",
    )

    message_type = Column(
        String(50),
        nullable=True,
    )
