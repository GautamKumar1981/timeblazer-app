"""Tests for authentication endpoints."""
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


def test_register_success(client):
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == 'test@example.com'


def test_register_duplicate_email(client):
    client.post('/api/auth/register', json={
        'username': 'testuser1',
        'email': 'dup@example.com',
        'password': 'password123',
    })
    response = client.post('/api/auth/register', json={
        'username': 'testuser2',
        'email': 'dup@example.com',
        'password': 'password123',
    })
    assert response.status_code == 409


def test_register_missing_fields(client):
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
    })
    assert response.status_code == 400


def test_login_success(client):
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'email': 'login@example.com',
        'password': 'password123',
    })
    response = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'password123',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data


def test_login_wrong_password(client):
    client.post('/api/auth/register', json={
        'username': 'loginuser2',
        'email': 'login2@example.com',
        'password': 'password123',
    })
    response = client.post('/api/auth/login', json={
        'email': 'login2@example.com',
        'password': 'wrongpassword',
    })
    assert response.status_code == 401


def test_me_endpoint(client):
    reg = client.post('/api/auth/register', json={
        'username': 'meuser',
        'email': 'me@example.com',
        'password': 'password123',
    })
    token = reg.get_json()['access_token']
    response = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['email'] == 'me@example.com'


def test_me_no_token(client):
    response = client.get('/api/auth/me')
    assert response.status_code == 401
