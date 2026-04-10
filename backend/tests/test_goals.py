import pytest

REGISTER_URL = '/api/auth/register'
GOALS_URL = '/api/goals/'

GOAL_DATA = {
    'title': 'Learn Flask',
    'description': 'Build a complete Flask backend',
    'target_date': '2024-12-31T00:00:00',
    'status': 'active',
    'progress': 10,
}


def _get_token(client, username='goaluser', email='goal@example.com'):
    resp = client.post(REGISTER_URL, json={
        'username': username,
        'email': email,
        'password': 'password123',
    })
    return resp.get_json()['access_token']


def _auth(token):
    return {'Authorization': f'Bearer {token}'}


def test_list_goals_empty(client, db):
    token = _get_token(client, 'listemptygoal', 'listemptygoal@example.com')
    resp = client.get(GOALS_URL, headers=_auth(token))
    assert resp.status_code == 200
    assert resp.get_json()['goals'] == []


def test_create_goal(client, db):
    token = _get_token(client, 'creategoal', 'creategoal@example.com')
    resp = client.post(GOALS_URL, json=GOAL_DATA, headers=_auth(token))
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'goal' in data
    assert data['goal']['title'] == 'Learn Flask'


def test_create_goal_missing_title(client, db):
    token = _get_token(client, 'missingtitle', 'missingtitle@example.com')
    resp = client.post(GOALS_URL, json={'description': 'No title'}, headers=_auth(token))
    assert resp.status_code == 400


def test_get_goal(client, db):
    token = _get_token(client, 'getgoal', 'getgoal@example.com')
    create_resp = client.post(GOALS_URL, json=GOAL_DATA, headers=_auth(token))
    goal_id = create_resp.get_json()['goal']['id']
    resp = client.get(f'{GOALS_URL}{goal_id}', headers=_auth(token))
    assert resp.status_code == 200
    assert resp.get_json()['goal']['id'] == goal_id


def test_get_goal_not_found(client, db):
    token = _get_token(client, 'notfoundgoal', 'notfoundgoal@example.com')
    resp = client.get(f'{GOALS_URL}9999', headers=_auth(token))
    assert resp.status_code == 404


def test_update_goal(client, db):
    token = _get_token(client, 'updategoal', 'updategoal@example.com')
    create_resp = client.post(GOALS_URL, json=GOAL_DATA, headers=_auth(token))
    goal_id = create_resp.get_json()['goal']['id']
    resp = client.put(
        f'{GOALS_URL}{goal_id}',
        json={'title': 'Updated Goal', 'progress': 50},
        headers=_auth(token),
    )
    assert resp.status_code == 200
    data = resp.get_json()['goal']
    assert data['title'] == 'Updated Goal'
    assert data['progress'] == 50


def test_delete_goal(client, db):
    token = _get_token(client, 'deletegoal', 'deletegoal@example.com')
    create_resp = client.post(GOALS_URL, json=GOAL_DATA, headers=_auth(token))
    goal_id = create_resp.get_json()['goal']['id']
    resp = client.delete(f'{GOALS_URL}{goal_id}', headers=_auth(token))
    assert resp.status_code == 200
    assert 'deleted' in resp.get_json()['message']


def test_goals_require_auth(client, db):
    resp = client.get(GOALS_URL)
    assert resp.status_code == 401
