import pytest
from datetime import date


def test_weekly_analytics(client, auth_headers):
    response = client.get('/api/analytics/week', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'week_start' in data
    assert 'total_timeboxes' in data


def test_monthly_analytics(client, auth_headers):
    today = date.today()
    response = client.get(
        f'/api/analytics/month?month={today.month}&year={today.year}',
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'month' in data
    assert 'total_timeboxes' in data


def test_patterns(client, auth_headers):
    response = client.get('/api/analytics/patterns', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'by_hour' in data
    assert 'by_day_of_week' in data


def test_streaks(client, auth_headers):
    response = client.get('/api/analytics/streaks', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'current_streak' in data
    assert 'longest_streak' in data


def test_analytics_requires_auth(client):
    response = client.get('/api/analytics/week')
    assert response.status_code == 401
