
import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.core.security import hash_password, create_access_token
from app.models.user import User
from app.models.project import Project
from app.models.lead import Lead
from app.models.booking import VisitSlot


@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def test_user(test_db):
    user = User(
        full_name="Test Admin",
        email="admin@test.com",
        hashed_password=hash_password("TestPassword@123"),
        role="admin",
        is_active=True,
    )

    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    return user


@pytest.fixture
def test_project(test_db):
    project = Project(
        name="Test Residential Project",
        location="Ahmedabad, Gujarat",
        description="Test project for API testing.",
        configuration="2 BHK, 3 BHK",
        total_units=100,
        available_units=50,
        min_price=6500000,
        max_price=12000000,
        is_active=True,
    )

    test_db.add(project)
    test_db.commit()
    test_db.refresh(project)

    return project


@pytest.fixture
def test_lead(test_db, test_project):
    lead = Lead(
        lead_code="LD-TEST001",
        name="Test Buyer",
        phone="9876500001",
        email="buyer@test.com",
        source="Website",
        project_id=test_project.id,
        configuration="2 BHK",
        budget_min=6500000,
        budget_max=8500000,
        requirements="Looking for a 2 BHK apartment.",
        status="new",
        priority="normal",
        consent_whatsapp=False,
    )

    test_db.add(lead)
    test_db.commit()
    test_db.refresh(lead)

    return lead


@pytest.fixture
def test_slot(test_db, test_project):
    from datetime import datetime, timedelta, timezone

    slot_time = datetime.now(timezone.utc) + timedelta(days=3)
    slot_time = slot_time.replace(
        minute=0,
        second=0,
        microsecond=0,
    )

    slot = VisitSlot(
        project_id=test_project.id,
        starts_at=slot_time,
        capacity=1,
    )

    test_db.add(slot)
    test_db.commit()
    test_db.refresh(slot)

    return slot


@pytest.fixture
def client(test_db):
    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(subject=str(test_user.id))

    return {
        "Authorization": f"Bearer {token}"
    }
