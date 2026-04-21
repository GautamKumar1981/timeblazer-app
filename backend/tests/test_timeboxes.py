import json
import pytest


def get_token(client, email='timebox@example.com'):
    client.post(
        '/api/auth/register',
        data=json.dumps({'email': email, 'name': 'Timebox User', 'password': 'password123'}),
        content_type='application/json',
    )
    resp = client.post(
        '/api/auth/login',
        data=json.dumps({'email': email, 'password': 'password123'}),
        content_type='application/json',
    )
    return json.loads(resp.data)['token']


class TestTimeboxes:
    def test_create_timebox(self, client):
        token = get_token(client)
        response = client.post(
            '/api/timeboxes',
            data=json.dumps({'title': 'Focus session', 'duration_minutes': 25}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['timebox']['title'] == 'Focus session'
        assert data['timebox']['duration_minutes'] == 25

    def test_get_timeboxes_empty(self, client):
        token = get_token(client)
        response = client.get(
            '/api/timeboxes',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['timeboxes'] == []

    def test_get_timeboxes_with_data(self, client):
        token = get_token(client)
        client.post(
            '/api/timeboxes',
            data=json.dumps({'title': 'Session 1'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        response = client.get(
            '/api/timeboxes',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['timeboxes']) == 1

    def test_update_timebox(self, client):
        token = get_token(client)
        create_resp = client.post(
            '/api/timeboxes',
            data=json.dumps({'title': 'Old title'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        timebox_id = json.loads(create_resp.data)['timebox']['id']
        response = client.put(
            f'/api/timeboxes/{timebox_id}',
            data=json.dumps({'title': 'New title', 'status': 'completed'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['timebox']['title'] == 'New title'
        assert data['timebox']['status'] == 'completed'

    def test_delete_timebox(self, client):
        token = get_token(client)
        create_resp = client.post(
            '/api/timeboxes',
            data=json.dumps({'title': 'To delete'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        timebox_id = json.loads(create_resp.data)['timebox']['id']
        response = client.delete(
            f'/api/timeboxes/{timebox_id}',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200

    def test_timebox_not_found(self, client):
        token = get_token(client)
        response = client.get(
            '/api/timeboxes/99999',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 404

    def test_create_timebox_no_title(self, client):
        token = get_token(client)
        response = client.post(
            '/api/timeboxes',
            data=json.dumps({'duration_minutes': 25}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 400

    def test_timebox_requires_auth(self, client):
        response = client.get('/api/timeboxes')
        assert response.status_code == 401
