"""Tests for goal endpoints."""
import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope='module')
def app():
    application = create_app('testing')
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def clean_db(app):
    with app.app_context():
        yield
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def auth_token(client):
    reg = client.post('/api/auth/register', json={
        'username': 'goaluser',
        'email': 'goal@example.com',
        'password': 'password123',
    })
    return reg.get_json()['access_token']


def test_get_goals_empty(client, auth_token):
    response = client.get('/api/goals', headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200
    assert response.get_json()['goals'] == []


def test_create_goal(client, auth_token):
    response = client.post('/api/goals', json={
        'title': 'Finish project',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 201
    data = response.get_json()
    assert data['goal']['title'] == 'Finish project'


def test_create_goal_missing_title(client, auth_token):
    response = client.post('/api/goals', json={
        'description': 'no title',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 400


def test_update_goal(client, auth_token):
    create_resp = client.post('/api/goals', json={
        'title': 'Original goal',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    goal_id = create_resp.get_json()['goal']['id']

    response = client.put(f'/api/goals/{goal_id}', json={
        'title': 'Updated goal',
        'completed': True,
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200
    assert response.get_json()['goal']['completed'] is True


def test_delete_goal(client, auth_token):
    create_resp = client.post('/api/goals', json={
        'title': 'To delete',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    goal_id = create_resp.get_json()['goal']['id']

    response = client.delete(f'/api/goals/{goal_id}',
                             headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200


def test_goal_not_found(client, auth_token):
    response = client.put('/api/goals/9999', json={'title': 'X'},
                          headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 404


def test_goals_require_auth(client):
    response = client.get('/api/goals')
    assert response.status_code == 401
