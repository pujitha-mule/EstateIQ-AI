
from app.models.project import FactSheet


def test_assistant_greeting(client, auth_headers, test_lead):
    response = client.post(
        "/api/chat",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "message": "Hello",
            "language": "en",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "reply" in data
    assert "Hello" in data["reply"]


def test_assistant_uses_verified_location(
    client,
    auth_headers,
    test_db,
    test_lead,
    test_project,
):
    fact = FactSheet(
        project_id=test_project.id,
        category="Location",
        key="location",
        value="Ahmedabad, Gujarat",
        is_verified=True,
    )

    test_db.add(fact)
    test_db.commit()

    response = client.post(
        "/api/chat",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "message": "Where is the project located?",
            "language": "en",
        },
    )

    assert response.status_code == 200
    assert "Ahmedabad" in response.json()["reply"]


def test_assistant_does_not_use_unverified_price(
    client,
    auth_headers,
    test_lead,
):
    response = client.post(
        "/api/chat",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "message": "What is the price?",
            "language": "en",
        },
    )

    assert response.status_code == 200

    reply = response.json()["reply"].lower()

    assert "verified" in reply or "sales team" in reply


def test_chat_history(
    client,
    auth_headers,
    test_lead,
):
    client.post(
        "/api/chat",
        headers=auth_headers,
        json={
            "lead_id": test_lead.id,
            "message": "Hello",
            "language": "en",
        },
    )

    response = client.get(
        f"/api/chat/{test_lead.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert len(response.json()) >= 2
    assert response.json()[0]["sender"] == "user"


def test_chat_for_unknown_lead(client, auth_headers):
    response = client.post(
        "/api/chat",
        headers=auth_headers,
        json={
            "lead_id": 99999,
            "message": "Hello",
            "language": "en",
        },
    )

    assert response.status_code == 404
