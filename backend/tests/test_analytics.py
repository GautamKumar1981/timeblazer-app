from datetime import datetime, timedelta, timezone, date


def _create_timebox(client, headers, **overrides):
    base = {
        "title": "Work session",
        "start_time": (datetime.now(timezone.utc)).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "category": "Work",
        "estimated_duration": 60,
    }
    base.update(overrides)
    return client.post("/api/timeboxes/", json=base, headers=headers)


def test_weekly_stats_empty(client, sample_user, auth_headers):
    resp = client.get("/api/analytics/week", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_timeboxes"] == 0
    assert data["completion_rate"] == 0.0


def test_weekly_stats_with_data(client, sample_user, auth_headers):
    r = _create_timebox(client, auth_headers)
    tid = r.get_json()["id"]
    client.post(f"/api/timeboxes/{tid}/complete", json={"actual_duration": 55}, headers=auth_headers)

    resp = client.get("/api/analytics/week", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_timeboxes"] >= 1
    assert data["completed_count"] >= 1
    assert data["completion_rate"] > 0


def test_weekly_stats_invalid_date(client, sample_user, auth_headers):
    resp = client.get("/api/analytics/week?week_start=not-a-date", headers=auth_headers)
    assert resp.status_code == 400


def test_monthly_stats(client, sample_user, auth_headers):
    today = date.today()
    resp = client.get(
        f"/api/analytics/month?month={today.month}&year={today.year}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "total_timeboxes" in data
    assert "completion_rate" in data


def test_monthly_stats_invalid_month(client, sample_user, auth_headers):
    resp = client.get("/api/analytics/month?month=13&year=2024", headers=auth_headers)
    assert resp.status_code == 400


def test_patterns_empty(client, sample_user, auth_headers):
    resp = client.get("/api/analytics/patterns", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "busiest_days" in data
    assert "busiest_hours" in data


def test_streaks_empty(client, sample_user, auth_headers):
    resp = client.get("/api/analytics/streaks", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["current_streak"] == 0
    assert data["longest_streak"] == 0


def test_calculate_accuracy():
    from app.services.analytics_service import AnalyticsService
    # Perfect accuracy
    assert AnalyticsService.calculate_accuracy(60, 60) == 100.0
    # Within tolerance (60 estimated, 70 actual = ~83%)
    acc = AnalyticsService.calculate_accuracy(60, 70)
    assert 0 < acc <= 100
    # Far overrun
    acc2 = AnalyticsService.calculate_accuracy(60, 300)
    assert acc2 < acc
