
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    location = Column(String(255), nullable=False)

    description = Column(Text, nullable=True)
    configuration = Column(String(100), nullable=True)

    total_units = Column(Integer, default=0)
    available_units = Column(Integer, default=0)

    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)

    rera_number = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class FactSheet(Base):
    __tablename__ = "fact_sheets"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    category = Column(String(100), nullable=True)
    key = Column(String(150), nullable=False)
    value = Column(Text, nullable=False)

    is_verified = Column(Boolean, default=False, nullable=False)

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
