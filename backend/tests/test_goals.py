import json


def get_token(client, email='goal@example.com'):
    client.post(
        '/api/auth/register',
        data=json.dumps({'email': email, 'name': 'Goal User', 'password': 'password123'}),
        content_type='application/json',
    )
    resp = client.post(
        '/api/auth/login',
        data=json.dumps({'email': email, 'password': 'password123'}),
        content_type='application/json',
    )
    return json.loads(resp.data)['token']


class TestGoals:
    def test_create_goal(self, client):
        token = get_token(client)
        response = client.post(
            '/api/goals',
            data=json.dumps({'title': 'Learn Python', 'description': 'Master Python in 3 months'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['goal']['title'] == 'Learn Python'
        assert data['goal']['progress'] == 0

    def test_get_goals_empty(self, client):
        token = get_token(client)
        response = client.get(
            '/api/goals',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['goals'] == []

    def test_update_goal(self, client):
        token = get_token(client)
        create_resp = client.post(
            '/api/goals',
            data=json.dumps({'title': 'Goal 1'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        goal_id = json.loads(create_resp.data)['goal']['id']
        response = client.put(
            f'/api/goals/{goal_id}',
            data=json.dumps({'progress': 50, 'status': 'active'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['goal']['progress'] == 50

    def test_delete_goal(self, client):
        token = get_token(client)
        create_resp = client.post(
            '/api/goals',
            data=json.dumps({'title': 'To delete'}),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'},
        )
        goal_id = json.loads(create_resp.data)['goal']['id']
        response = client.delete(
            f'/api/goals/{goal_id}',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 200

    def test_goal_not_found(self, client):
        token = get_token(client)
        response = client.get(
            '/api/goals/99999',
            headers={'Authorization': f'Bearer {token}'},
        )
        assert response.status_code == 404

    def test_goals_requires_auth(self, client):
        response = client.get('/api/goals')
        assert response.status_code == 401
