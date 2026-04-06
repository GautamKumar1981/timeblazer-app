from datetime import date


def test_get_today_empty(client, sample_user, auth_headers):
    resp = client.get("/api/priorities/today", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == {}


def test_create_priorities(client, sample_user, auth_headers):
    resp = client.post(
        "/api/priorities/",
        json={
            "priority_1": "Finish report",
            "priority_2": "Team meeting",
            "priority_3": "Code review",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["priority_1"] == "Finish report"
    assert data["priority_3"] == "Code review"
    assert data["completion_status"] == 0


def test_get_today_after_create(client, sample_user, auth_headers):
    client.post(
        "/api/priorities/",
        json={"priority_1": "Morning workout"},
        headers=auth_headers,
    )
    resp = client.get("/api/priorities/today", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["priority_1"] == "Morning workout"


def test_upsert_priority(client, sample_user, auth_headers):
    client.post(
        "/api/priorities/",
        json={"priority_1": "First"},
        headers=auth_headers,
    )
    resp = client.post(
        "/api/priorities/",
        json={"priority_1": "Updated First", "priority_2": "Second"},
        headers=auth_headers,
    )
    # Second POST to same date should update (200)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["priority_1"] == "Updated First"
    assert data["priority_2"] == "Second"


def test_update_priority(client, sample_user, auth_headers):
    create_resp = client.post(
        "/api/priorities/",
        json={"priority_1": "Task A"},
        headers=auth_headers,
    )
    pid = create_resp.get_json()["id"]
    resp = client.put(
        f"/api/priorities/{pid}",
        json={"completion_status": 1},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.get_json()["completion_status"] == 1


def test_update_nonexistent_priority(client, sample_user, auth_headers):
    resp = client.put(
        "/api/priorities/99999",
        json={"completion_status": 1},
        headers=auth_headers,
    )
    assert resp.status_code == 404
