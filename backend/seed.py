
from datetime import datetime, timedelta, timezone

from app.database import Base, engine, SessionLocal
from app import models

from app.core.security import hash_password

from app.models.user import User
from app.models.project import Project, FactSheet
from app.models.lead import Lead
from app.models.booking import VisitSlot, Booking


def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Demo staff accounts.
        users = [
            {
                "full_name": "EstateIQ Admin",
                "email": "admin@estateiq.ai",
                "password": "EstateIQ@123",
                "role": "admin",
            },
            {
                "full_name": "Aarav Mehta",
                "email": "aarav@estateiq.ai",
                "password": "Sales@123",
                "role": "sales_executive",
            },
            {
                "full_name": "Riya Desai",
                "email": "riya@estateiq.ai",
                "password": "Sales@123",
                "role": "sales_executive",
            },
            {
                "full_name": "Sales Head",
                "email": "head@estateiq.ai",
                "password": "Sales@123",
                "role": "sales_head",
            },
        ]

        for item in users:
            existing = db.query(User).filter(
                User.email == item["email"]
            ).first()

            if not existing:
                db.add(
                    User(
                        full_name=item["full_name"],
                        email=item["email"],
                        hashed_password=hash_password(item["password"]),
                        role=item["role"],
                        is_active=True,
                    )
                )

        db.flush()

        # Demo projects.
        projects_data = [
            {
                "name": "EstateIQ Project 1",
                "location": "Ahmedabad, Gujarat",
                "description": "Residential apartment development.",
                "configuration": "2 BHK, 3 BHK",
                "total_units": 220,
                "available_units": 110,
                "min_price": 6500000,
                "max_price": 12000000,
                "rera_number": None,
            },
            {
                "name": "EstateIQ Project 2",
                "location": "Ahmedabad, Gujarat",
                "description": "Residential apartment development.",
                "configuration": "2 BHK, 3 BHK",
                "total_units": 200,
                "available_units": 95,
                "min_price": 6500000,
                "max_price": 12000000,
                "rera_number": None,
            },
        ]

        projects = []

        for item in projects_data:
            project = db.query(Project).filter(
                Project.name == item["name"]
            ).first()

            if not project:
                project = Project(**item, is_active=True)
                db.add(project)
                db.flush()

            projects.append(project)

        # Add verified basic project facts.
        for project in projects:
            facts = [
                ("configuration", project.configuration or "Not confirmed"),
                ("location", project.location),
            ]

            for key, value in facts:
                existing_fact = db.query(FactSheet).filter(
                    FactSheet.project_id == project.id,
                    FactSheet.key == key,
                ).first()

                if not existing_fact:
                    db.add(
                        FactSheet(
                            project_id=project.id,
                            category="Project information",
                            key=key,
                            value=value,
                            is_verified=True,
                        )
                    )

        db.flush()

        # Sample leads.
        leads_data = [
            {
                "lead_code": "LD-58210",
                "name": "Hardik Patel",
                "phone": "9876500010",
                "email": "hardik@example.com",
                "source": "Website",
                "project_id": projects[0].id,
                "configuration": "3 BHK",
                "status": "booked",
                "priority": "high",
                "budget_min": 9000000,
                "budget_max": 12000000,
            },
            {
                "lead_code": "LD-58211",
                "name": "Nidhi Shah",
                "phone": "9876500011",
                "email": "nidhi@example.com",
                "source": "Google Ads",
                "project_id": projects[1].id,
                "configuration": "2 BHK",
                "status": "contacted",
                "priority": "normal",
                "budget_min": 6500000,
                "budget_max": 8500000,
            },
            {
                "lead_code": "LD-58224",
                "name": "Kavita Joshi",
                "phone": "9876500024",
                "email": "kavita@example.com",
                "source": "Referral",
                "project_id": projects[1].id,
                "configuration": "2 BHK",
                "status": "visited",
                "priority": "normal",
                "budget_min": 6500000,
                "budget_max": 8500000,
            },
        ]

        seeded_leads = {}

        for item in leads_data:
            lead = db.query(Lead).filter(
                Lead.lead_code == item["lead_code"]
            ).first()

            if not lead:
                lead = Lead(
                    **item,
                    consent_whatsapp=False,
                )
                db.add(lead)
                db.flush()

            seeded_leads[item["lead_code"]] = lead

        # Generate demo slots for the next seven days.
        now = datetime.now(timezone.utc)

        for project in projects:
            for day_offset in range(1, 8):
                visit_day = now + timedelta(days=day_offset)

                for hour in range(10, 17):
                    slot_time = visit_day.replace(
                        hour=hour,
                        minute=0,
                        second=0,
                        microsecond=0,
                    )

                    existing_slot = db.query(VisitSlot).filter(
                        VisitSlot.project_id == project.id,
                        VisitSlot.starts_at == slot_time,
                    ).first()

                    if not existing_slot:
                        db.add(
                            VisitSlot(
                                project_id=project.id,
                                starts_at=slot_time,
                                capacity=1,
                            )
                        )

        db.flush()

        # Demo booking for Hardik Patel.
        hardik = seeded_leads["LD-58210"]

        existing_booking = db.query(Booking).filter(
            Booking.lead_id == hardik.id
        ).first()

        if not existing_booking:
            demo_time = datetime(
                2026, 11, 1, 11, 0,
                tzinfo=timezone.utc,
            )

            db.add(
                Booking(
                    lead_id=hardik.id,
                    project_id=projects[0].id,
                    slot_start=demo_time,
                    slot_end=demo_time + timedelta(hours=1),
                    status="confirmed",
                    notes="Demo site visit booking.",
                )
            )

        db.commit()

        print("EstateIQ AI database seeded successfully.")
        print("Admin login: admin@estateiq.ai")
        print("Admin password: EstateIQ@123")
        print("Sales login: aarav@estateiq.ai")
        print("Sales password: Sales@123")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
