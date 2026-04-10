import json
import pytest


REGISTER_URL = '/api/auth/register'
LOGIN_URL = '/api/auth/login'
ME_URL = '/api/auth/me'
LOGOUT_URL = '/api/auth/logout'


def _register(client, username='testuser', email='test@example.com', password='password123'):
    return client.post(REGISTER_URL, json={
        'username': username,
        'email': email,
        'password': password,
    })


def test_register_success(client, db):
    resp = _register(client)
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['email'] == 'test@example.com'


def test_register_duplicate_email(client, db):
    _register(client, username='user1', email='dup@example.com')
    resp = _register(client, username='user2', email='dup@example.com')
    assert resp.status_code == 400
    assert 'error' in resp.get_json()


def test_register_duplicate_username(client, db):
    _register(client, username='dupname', email='first@example.com')
    resp = _register(client, username='dupname', email='second@example.com')
    assert resp.status_code == 400
    assert 'error' in resp.get_json()


def test_register_missing_fields(client, db):
    resp = client.post(REGISTER_URL, json={'username': 'nopass'})
    assert resp.status_code == 400
    assert 'error' in resp.get_json()


def test_login_success(client, db):
    _register(client, username='loginuser', email='login@example.com', password='mypass')
    resp = client.post(LOGIN_URL, json={'email': 'login@example.com', 'password': 'mypass'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'access_token' in data
    assert 'user' in data


def test_login_wrong_password(client, db):
    _register(client, username='wrongpw', email='wrongpw@example.com', password='correct')
    resp = client.post(LOGIN_URL, json={'email': 'wrongpw@example.com', 'password': 'wrong'})
    assert resp.status_code == 401


def test_login_nonexistent_user(client, db):
    resp = client.post(LOGIN_URL, json={'email': 'noone@example.com', 'password': 'pass'})
    assert resp.status_code == 401


def test_get_me_authenticated(client, db):
    reg = _register(client, username='meuser', email='me@example.com')
    token = reg.get_json()['access_token']
    resp = client.get(ME_URL, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'user' in data
    assert data['user']['email'] == 'me@example.com'


def test_get_me_unauthenticated(client, db):
    resp = client.get(ME_URL)
    assert resp.status_code == 401


def test_logout(client, db):
    reg = _register(client, username='logoutuser', email='logout@example.com')
    token = reg.get_json()['access_token']
    resp = client.post(LOGOUT_URL, headers={'Authorization': f'Bearer {token}'})
    assert resp.status_code == 200
    assert resp.get_json()['message'] == 'Logged out successfully'
