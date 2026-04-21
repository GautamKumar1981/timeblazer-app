"""Tests for timebox endpoints."""
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
        'username': 'tboxuser',
        'email': 'tbox@example.com',
        'password': 'password123',
    })
    return reg.get_json()['access_token']


def test_get_timeboxes_empty(client, auth_token):
    response = client.get('/api/timeboxes', headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200
    assert response.get_json()['timeboxes'] == []


def test_create_timebox(client, auth_token):
    response = client.post('/api/timeboxes', json={
        'title': 'Morning work',
        'start_time': '2026-04-10T09:00:00',
        'end_time': '2026-04-10T10:00:00',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 201
    data = response.get_json()
    assert data['timebox']['title'] == 'Morning work'


def test_create_timebox_missing_fields(client, auth_token):
    response = client.post('/api/timeboxes', json={
        'title': 'Incomplete',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 400


def test_update_timebox(client, auth_token):
    create_resp = client.post('/api/timeboxes', json={
        'title': 'Original',
        'start_time': '2026-04-10T09:00:00',
        'end_time': '2026-04-10T10:00:00',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.put(f'/api/timeboxes/{timebox_id}', json={
        'title': 'Updated',
        'completed': True,
    }, headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200
    assert response.get_json()['timebox']['title'] == 'Updated'
    assert response.get_json()['timebox']['completed'] is True


def test_delete_timebox(client, auth_token):
    create_resp = client.post('/api/timeboxes', json={
        'title': 'To delete',
        'start_time': '2026-04-10T09:00:00',
        'end_time': '2026-04-10T10:00:00',
    }, headers={'Authorization': f'Bearer {auth_token}'})
    timebox_id = create_resp.get_json()['timebox']['id']

    response = client.delete(f'/api/timeboxes/{timebox_id}',
                             headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 200


def test_timebox_not_found(client, auth_token):
    response = client.put('/api/timeboxes/9999', json={'title': 'X'},
                          headers={'Authorization': f'Bearer {auth_token}'})
    assert response.status_code == 404


def test_timeboxes_require_auth(client):
    response = client.get('/api/timeboxes')
    assert response.status_code == 401
