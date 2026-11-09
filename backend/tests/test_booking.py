from app.models.lead import Lead


def test_get_available_slots(
    client,
    auth_headers,
    test_project,
    test_slot,
):
    response = client.get(
        "/api/slots",
        params={
            "project_id": test_project.id,
            "visit_date": test_slot.starts_at.date().isoformat(),
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    slots = response.json()

    assert len(slots) == 1
    assert slots[0]["id"] == test_slot.id
    assert slots[0]["project_id"] == test_project.id
    assert slots[0]["available"] is True
    assert slots[0]["booked_count"] == 0


def test_create_booking(
    client,
    auth_headers,
    test_lead,
    test_project,
    test_slot,
):
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "project_id": test_project.id,
            "slot_id": test_slot.id,
            "notes": "First site visit.",
        },
    )

    assert response.status_code == 201, response.text

    data = response.json()

    assert data["lead_id"] == test_lead.id
    assert data["project_id"] == test_project.id
    assert data["slot_id"] == test_slot.id
    assert data["status"] == "confirmed"


def test_prevent_duplicate_booking(
    client,
    auth_headers,
    test_db,
    test_lead,
    test_project,
    test_slot,
):
    first_booking = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "project_id": test_project.id,
            "slot_id": test_slot.id,
        },
    )

    assert first_booking.status_code == 201, first_booking.text

    second_lead = Lead(
        lead_code="LD-TEST002",
        name="Second Test Buyer",
        phone="9876500003",
        email="second@test.com",
        source="Referral",
        project_id=test_project.id,
        status="new",
        priority="normal",
        consent_whatsapp=False,
    )

    test_db.add(second_lead)
    test_db.commit()
    test_db.refresh(second_lead)

    second_booking = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "lead_id": second_lead.id,
            "project_id": test_project.id,
            "slot_id": test_slot.id,
        },
    )

    assert second_booking.status_code == 409


def test_booking_unknown_lead(
    client,
    auth_headers,
    test_project,
    test_slot,
):
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "lead_id": 99999,
            "project_id": test_project.id,
            "slot_id": test_slot.id,
        },
    )

    assert response.status_code == 404


def test_booking_unknown_slot(
    client,
    auth_headers,
    test_lead,
    test_project,
):
    response = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "project_id": test_project.id,
            "slot_id": 99999,
        },
    )

    assert response.status_code == 404