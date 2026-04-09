import pytest
import json


def register_user(client, email='test@example.com', name='Test User', password='password123'):
    return client.post(
        '/api/auth/register',
        data=json.dumps({'email': email, 'name': name, 'password': password}),
        content_type='application/json',
    )


def login_user(client, email='test@example.com', password='password123'):
    return client.post(
        '/api/auth/login',
        data=json.dumps({'email': email, 'password': password}),
        content_type='application/json',
    )


class TestRegister:
    def test_register_success(self, client):
        response = register_user(client)
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'token' in data
        assert data['user']['email'] == 'test@example.com'
        assert data['user']['name'] == 'Test User'

    def test_register_missing_fields(self, client):
        response = client.post(
            '/api/auth/register',
            data=json.dumps({'email': 'test@example.com'}),
            content_type='application/json',
        )
        assert response.status_code == 400

    def test_register_duplicate_email(self, client):
        register_user(client)
        response = register_user(client)
        assert response.status_code == 409

    def test_register_short_password(self, client):
        response = register_user(client, password='123')
        assert response.status_code == 400

    def test_register_no_data(self, client):
        response = client.post('/api/auth/register', content_type='application/json')
        assert response.status_code == 400


class TestLogin:
    def test_login_success(self, client):
        register_user(client)
        response = login_user(client)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
        assert data['user']['email'] == 'test@example.com'

    def test_login_wrong_password(self, client):
        register_user(client)
        response = login_user(client, password='wrongpassword')
        assert response.status_code == 401

    def test_login_unknown_email(self, client):
        response = login_user(client, email='nobody@example.com')
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        response = client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'test@example.com'}),
            content_type='application/json',
        )
        assert response.status_code == 400


class TestGetMe:
    def test_get_me_authenticated(self, client):
        register_user(client)
        login_resp = login_user(client)
        token = json.loads(login_resp.data)['token']
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['user']['email'] == 'test@example.com'

    def test_get_me_no_token(self, client):
        response = client.get('/api/auth/me')
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': 'Bearer invalidtoken'},
        )
        assert response.status_code == 401
