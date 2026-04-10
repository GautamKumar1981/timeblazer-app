import pytest

REGISTER_URL = '/api/auth/register'
TIMEBOXES_URL = '/api/timeboxes/'

TIMEBOX_DATA = {
    'title': 'Morning Focus',
    'start_time': '2024-01-15T09:00:00',
    'end_time': '2024-01-15T10:00:00',
    'description': 'Deep work session',
    'priority': 'high',
}


def _get_token(client, username='tbuser', email='tb@example.com'):
    resp = client.post(REGISTER_URL, json={
        'username': username,
        'email': email,
        'password': 'password123',
    })
    return resp.get_json()['access_token']


def _auth(token):
    return {'Authorization': f'Bearer {token}'}


def test_list_timeboxes_empty(client, db):
    token = _get_token(client, 'listempty', 'listempty@example.com')
    resp = client.get(TIMEBOXES_URL, headers=_auth(token))
    assert resp.status_code == 200
    assert resp.get_json()['timeboxes'] == []


def test_create_timebox(client, db):
    token = _get_token(client, 'createtb', 'createtb@example.com')
    resp = client.post(TIMEBOXES_URL, json=TIMEBOX_DATA, headers=_auth(token))
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'timebox' in data
    assert data['timebox']['title'] == 'Morning Focus'


def test_create_timebox_missing_fields(client, db):
    token = _get_token(client, 'missingfields', 'missingfields@example.com')
    resp = client.post(TIMEBOXES_URL, json={'title': 'No times'}, headers=_auth(token))
    assert resp.status_code == 400


def test_get_timebox(client, db):
    token = _get_token(client, 'gettb', 'gettb@example.com')
    create_resp = client.post(TIMEBOXES_URL, json=TIMEBOX_DATA, headers=_auth(token))
    tb_id = create_resp.get_json()['timebox']['id']
    resp = client.get(f'{TIMEBOXES_URL}{tb_id}', headers=_auth(token))
    assert resp.status_code == 200
    assert resp.get_json()['timebox']['id'] == tb_id


def test_get_timebox_not_found(client, db):
    token = _get_token(client, 'notfoundtb', 'notfoundtb@example.com')
    resp = client.get(f'{TIMEBOXES_URL}9999', headers=_auth(token))
    assert resp.status_code == 404


def test_update_timebox(client, db):
    token = _get_token(client, 'updatetb', 'updatetb@example.com')
    create_resp = client.post(TIMEBOXES_URL, json=TIMEBOX_DATA, headers=_auth(token))
    tb_id = create_resp.get_json()['timebox']['id']
    resp = client.put(
        f'{TIMEBOXES_URL}{tb_id}',
        json={'title': 'Updated Title', 'status': 'in_progress'},
        headers=_auth(token),
    )
    assert resp.status_code == 200
    data = resp.get_json()['timebox']
    assert data['title'] == 'Updated Title'
    assert data['status'] == 'in_progress'


def test_delete_timebox(client, db):
    token = _get_token(client, 'deletetb', 'deletetb@example.com')
    create_resp = client.post(TIMEBOXES_URL, json=TIMEBOX_DATA, headers=_auth(token))
    tb_id = create_resp.get_json()['timebox']['id']
    resp = client.delete(f'{TIMEBOXES_URL}{tb_id}', headers=_auth(token))
    assert resp.status_code == 200
    assert 'deleted' in resp.get_json()['message']


def test_timeboxes_require_auth(client, db):
    resp = client.get(TIMEBOXES_URL)
    assert resp.status_code == 401


def test_list_timeboxes_filter_status(client, db):
    token = _get_token(client, 'filtertb', 'filtertb@example.com')
    client.post(TIMEBOXES_URL, json={**TIMEBOX_DATA, 'status': 'completed'}, headers=_auth(token))
    client.post(TIMEBOXES_URL, json={**TIMEBOX_DATA, 'status': 'pending'}, headers=_auth(token))
    resp = client.get(f'{TIMEBOXES_URL}?status=completed', headers=_auth(token))
    assert resp.status_code == 200
    timeboxes = resp.get_json()['timeboxes']
    assert len(timeboxes) == 1
    assert timeboxes[0]['status'] == 'completed'
