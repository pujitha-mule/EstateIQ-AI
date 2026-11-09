
def test_health_check(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_leads(client, auth_headers, test_lead):
    response = client.get(
        "/api/leads",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test Buyer"


def test_create_lead(client, auth_headers, test_project):
    response = client.post(
        "/api/leads",
        headers=auth_headers,
        json={
            "name": "New Test Buyer",
            "phone": "9876500002",
            "email": "newbuyer@test.com",
            "source": "Website",
            "project_id": test_project.id,
            "configuration": "3 BHK",
            "budget_min": 9000000,
            "budget_max": 12000000,
            "requirements": "Looking for a 3 BHK apartment.",
            "consent_whatsapp": False,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "New Test Buyer"
    assert data["lead_code"].startswith("LD-")


def test_duplicate_phone_number(client, auth_headers, test_lead):
    response = client.post(
        "/api/leads",
        headers=auth_headers,
        json={
            "name": "Duplicate Buyer",
            "phone": test_lead.phone,
            "source": "Google Ads",
        },
    )

    assert response.status_code == 409


def test_get_single_lead(client, auth_headers, test_lead):
    response = client.get(
        f"/api/leads/{test_lead.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["lead_code"] == "LD-TEST001"


def test_unknown_lead_returns_404(client, auth_headers):
    response = client.get(
        "/api/leads/99999",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_dashboard(client, auth_headers, test_lead):
    response = client.get(
        "/api/dashboard",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_leads"] == 1
    assert "leads_by_source" in data
    assert "recent_leads" in data
