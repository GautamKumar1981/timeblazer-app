import pytest


def test_register(client):
    response = client.post('/api/auth/register', json={
        'email': 'newuser@example.com',
        'password': 'securepass',
        'name': 'New User',
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'user' in data
    assert 'access_token' in data
    assert data['user']['email'] == 'newuser@example.com'


def test_register_duplicate_email(client, sample_user):
    response = client.post('/api/auth/register', json={
        'email': sample_user.email,
        'password': 'password123',
        'name': 'Another User',
    })
    assert response.status_code == 409


def test_register_invalid_email(client):
    response = client.post('/api/auth/register', json={
        'email': 'not-an-email',
        'password': 'password123',
        'name': 'User',
    })
    assert response.status_code == 422


def test_login(client, sample_user):
    response = client.post('/api/auth/login', json={
        'email': sample_user.email,
        'password': 'password123',
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert 'refresh_token' in data


def test_login_invalid_password(client, sample_user):
    response = client.post('/api/auth/login', json={
        'email': sample_user.email,
        'password': 'wrongpassword',
    })
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get('/api/auth/me', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'user' in data


def test_get_me_no_token(client):
    response = client.get('/api/auth/me')
    assert response.status_code == 401
