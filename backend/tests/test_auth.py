def test_register_success(client):
    resp = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "securepass1", "name": "New User"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "new@example.com"


def test_register_duplicate_email(client, sample_user):
    resp = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "securepass1", "name": "Dup"},
    )
    assert resp.status_code == 409


def test_register_invalid_email(client):
    resp = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "securepass1", "name": "Bad"},
    )
    assert resp.status_code == 400


def test_register_short_password(client):
    resp = client.post(
        "/api/auth/register",
        json={"email": "short@example.com", "password": "short", "name": "Short"},
    )
    assert resp.status_code == 400


def test_login_success(client, sample_user):
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password(client, sample_user):
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "password123"},
    )
    assert resp.status_code == 401


def test_refresh_token(client, sample_user):
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    refresh_token = login_resp.get_json()["refresh_token"]
    resp = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()


def test_logout(client, sample_user, auth_headers):
    resp = client.post("/api/auth/logout", headers=auth_headers)
    assert resp.status_code == 200
    # Token should now be revoked
    protected_resp = client.get("/api/users/settings", headers=auth_headers)
    assert protected_resp.status_code == 401
