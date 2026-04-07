import pytest
from datetime import datetime, timedelta, timezone


def make_timebox_payload(offset_hours=1):
    now = datetime.now(timezone.utc)
    return {
        'title': 'Test Timebox',
        'start_time': (now + timedelta(hours=offset_hours)).isoformat(),
        'end_time': (now + timedelta(hours=offset_hours + 1)).isoformat(),
        'category': 'work',
    }


def test_create_timebox(client, auth_headers):
    response = client.post('/api/timeboxes/', json=make_timebox_payload(), headers=auth_headers)
    assert response.status_code == 201
    data = response.get_json()
    assert 'timebox' in data
    assert data['timebox']['title'] == 'Test Timebox'


def test_list_timeboxes(client, auth_headers):
    response = client.get('/api/timeboxes/', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'timeboxes' in data


def test_get_timebox(client, auth_headers):
    create_resp = client.post('/api/timeboxes/', json=make_timebox_payload(2), headers=auth_headers)
    assert create_resp.status_code == 201
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.get(f'/api/timeboxes/{timebox_id}', headers=auth_headers)
    assert response.status_code == 200
    assert response.get_json()['timebox']['id'] == timebox_id


def test_update_timebox(client, auth_headers):
    create_resp = client.post('/api/timeboxes/', json=make_timebox_payload(3), headers=auth_headers)
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.put(f'/api/timeboxes/{timebox_id}', json={'title': 'Updated'}, headers=auth_headers)
    assert response.status_code == 200
    assert response.get_json()['timebox']['title'] == 'Updated'


def test_delete_timebox(client, auth_headers):
    create_resp = client.post('/api/timeboxes/', json=make_timebox_payload(4), headers=auth_headers)
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.delete(f'/api/timeboxes/{timebox_id}', headers=auth_headers)
    assert response.status_code == 200

    get_resp = client.get(f'/api/timeboxes/{timebox_id}', headers=auth_headers)
    assert get_resp.status_code == 404


def test_update_status(client, auth_headers):
    create_resp = client.post('/api/timeboxes/', json=make_timebox_payload(5), headers=auth_headers)
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.patch(
        f'/api/timeboxes/{timebox_id}/status',
        json={'status': 'completed'},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.get_json()['timebox']['status'] == 'completed'


def test_create_timebox_invalid_times(client, auth_headers):
    now = datetime.now(timezone.utc)
    response = client.post('/api/timeboxes/', json={
        'title': 'Bad Timebox',
        'start_time': (now + timedelta(hours=2)).isoformat(),
        'end_time': (now + timedelta(hours=1)).isoformat(),
    }, headers=auth_headers)
    assert response.status_code == 422
