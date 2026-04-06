from datetime import date, timedelta


def _goal_payload(**overrides):
    base = {
        "title": "Run a marathon",
        "priority": "high",
        "target_date": (date.today() + timedelta(days=90)).isoformat(),
    }
    base.update(overrides)
    return base


def test_create_goal(client, sample_user, auth_headers):
    resp = client.post("/api/goals/", json=_goal_payload(), headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Run a marathon"
    assert data["status"] == "active"


def test_list_goals(client, sample_user, auth_headers):
    client.post("/api/goals/", json=_goal_payload(), headers=auth_headers)
    resp = client.get("/api/goals/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()) >= 1


def test_get_goal(client, sample_user, auth_headers):
    create_resp = client.post("/api/goals/", json=_goal_payload(), headers=auth_headers)
    gid = create_resp.get_json()["id"]
    resp = client.get(f"/api/goals/{gid}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["id"] == gid


def test_days_remaining(client, sample_user, auth_headers):
    target = date.today() + timedelta(days=30)
    create_resp = client.post(
        "/api/goals/",
        json=_goal_payload(target_date=target.isoformat()),
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    data = create_resp.get_json()
    assert data["days_remaining"] == 30


def test_update_goal(client, sample_user, auth_headers):
    create_resp = client.post("/api/goals/", json=_goal_payload(), headers=auth_headers)
    gid = create_resp.get_json()["id"]
    resp = client.put(
        f"/api/goals/{gid}",
        json={"title": "New Title", "status": "completed"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["title"] == "New Title"
    assert data["status"] == "completed"


def test_delete_goal(client, sample_user, auth_headers):
    create_resp = client.post("/api/goals/", json=_goal_payload(), headers=auth_headers)
    gid = create_resp.get_json()["id"]
    resp = client.delete(f"/api/goals/{gid}", headers=auth_headers)
    assert resp.status_code == 204
    get_resp = client.get(f"/api/goals/{gid}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_get_nonexistent_goal(client, sample_user, auth_headers):
    resp = client.get("/api/goals/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_goal_with_milestones(client, sample_user, auth_headers):
    milestones = [{"title": "Week 1 done", "completed": False}]
    resp = client.post(
        "/api/goals/",
        json=_goal_payload(milestones=milestones),
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert len(resp.get_json()["milestones"]) == 1
