
def test_successful_login(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "TestPassword@123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@test.com"
    assert data["user"]["role"] == "admin"


def test_login_with_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401


def test_login_with_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "unknown@test.com",
            "password": "TestPassword@123",
        },
    )

    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    response = client.get(
        "/api/auth/me",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["email"] == "admin@test.com"


def test_protected_profile_without_token(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
