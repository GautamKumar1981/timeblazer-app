from datetime import datetime, timedelta, timezone


def _tb_payload(**overrides):
    base = {
        "title": "Deep Work",
        "start_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        "category": "Work",
        "color": "#4F46E5",
        "estimated_duration": 60,
    }
    base.update(overrides)
    return base


def test_create_timebox(client, sample_user, auth_headers):
    resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Deep Work"
    assert data["status"] == "not_started"


def test_list_timeboxes(client, sample_user, auth_headers):
    client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    resp = client.get("/api/timeboxes/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()) >= 1


def test_get_timebox(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    resp = client.get(f"/api/timeboxes/{tid}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["id"] == tid


def test_update_timebox(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    resp = client.put(
        f"/api/timeboxes/{tid}",
        json={"title": "Updated Title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.get_json()["title"] == "Updated Title"


def test_delete_timebox(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    resp = client.delete(f"/api/timeboxes/{tid}", headers=auth_headers)
    assert resp.status_code == 204
    get_resp = client.get(f"/api/timeboxes/{tid}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_update_status(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    resp = client.patch(
        f"/api/timeboxes/{tid}/status",
        json={"status": "in_progress"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "in_progress"


def test_complete_timebox(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    resp = client.post(
        f"/api/timeboxes/{tid}/complete",
        json={"actual_duration": 55},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "completed"
    assert data["actual_duration"] == 55


def test_batch_create(client, sample_user, auth_headers):
    payload = [_tb_payload(title=f"TB {i}") for i in range(3)]
    resp = client.post("/api/timeboxes/batch", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    assert len(resp.get_json()) == 3


def test_filter_by_status(client, sample_user, auth_headers):
    create_resp = client.post("/api/timeboxes/", json=_tb_payload(), headers=auth_headers)
    tid = create_resp.get_json()["id"]
    client.post(f"/api/timeboxes/{tid}/complete", json={}, headers=auth_headers)
    resp = client.get("/api/timeboxes/?status=completed", headers=auth_headers)
    assert resp.status_code == 200
    assert all(t["status"] == "completed" for t in resp.get_json())


def test_invalid_color(client, sample_user, auth_headers):
    resp = client.post(
        "/api/timeboxes/",
        json=_tb_payload(color="notacolor"),
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_end_before_start(client, sample_user, auth_headers):
    now = datetime.now(timezone.utc)
    resp = client.post(
        "/api/timeboxes/",
        json=_tb_payload(
            start_time=(now + timedelta(hours=2)).isoformat(),
            end_time=(now + timedelta(hours=1)).isoformat(),
        ),
        headers=auth_headers,
    )
    assert resp.status_code == 400
