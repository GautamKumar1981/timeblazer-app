"""Tests for health endpoint."""
import pytest
from app import create_app


@pytest.fixture(scope='module')
def client():
    application = create_app('testing')
    with application.app_context():
        from app.extensions import db
        db.create_all()
        yield application.test_client()
        db.drop_all()


def test_health_returns_ok(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'


def test_health_includes_database(client):
    response = client.get('/api/health')
    data = response.get_json()
    assert 'database' in data
