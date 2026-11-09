
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    lead_code = Column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    name = Column(String(150), nullable=False)
    phone = Column(String(30), index=True, nullable=False)
    email = Column(String(255), nullable=True)

    source = Column(String(100), default="Website")

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=True,
    )

    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    configuration = Column(String(50), nullable=True)

    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)

    requirements = Column(Text, nullable=True)

    status = Column(String(50), default="new", nullable=False)
    priority = Column(String(30), default="normal", nullable=False)

    consent_whatsapp = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    consent_recorded_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
