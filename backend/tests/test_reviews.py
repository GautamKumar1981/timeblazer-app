from datetime import date, timedelta


def test_get_weekly_review_empty(client, sample_user, auth_headers):
    resp = client.get("/api/reviews/weekly", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() == {}


def test_generate_weekly_review(client, sample_user, auth_headers):
    resp = client.post("/api/reviews/weekly", json={}, headers=auth_headers)
    assert resp.status_code in (200, 201)
    data = resp.get_json()
    assert "completion_rate" in data
    assert "key_insights" in data
    assert "week_start_date" in data
    assert "week_end_date" in data


def test_generate_weekly_review_with_data(client, sample_user, auth_headers):
    week_start = (date.today() - timedelta(days=7)).isoformat()
    resp = client.post(
        "/api/reviews/weekly",
        json={
            "week_start_date": week_start,
            "next_week_focus": "Ship feature X",
            "wins": ["Completed all timeboxes on Monday"],
            "improvements": ["Sleep earlier"],
        },
        headers=auth_headers,
    )
    assert resp.status_code in (200, 201)
    data = resp.get_json()
    assert data["next_week_focus"] == "Ship feature X"
    assert "Completed all timeboxes on Monday" in data["wins"]


def test_generate_weekly_review_idempotent(client, sample_user, auth_headers):
    week_start = (date.today() - timedelta(days=14)).isoformat()
    payload = {"week_start_date": week_start}
    resp1 = client.post("/api/reviews/weekly", json=payload, headers=auth_headers)
    resp2 = client.post("/api/reviews/weekly", json=payload, headers=auth_headers)
    # Second call should return 200 (update)
    assert resp1.status_code == 201
    assert resp2.status_code == 200
    assert resp1.get_json()["week_start_date"] == resp2.get_json()["week_start_date"]


def test_get_weekly_review_after_create(client, sample_user, auth_headers):
    client.post("/api/reviews/weekly", json={}, headers=auth_headers)
    resp = client.get("/api/reviews/weekly", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json() != {}
