"""Tests for safe database initialization in create_app."""
import pytest
from unittest.mock import patch, MagicMock
from app import create_app
from app.extensions import db


def test_create_app_returns_app():
    """create_app returns a Flask application."""
    app = create_app('testing')
    assert app is not None


def test_create_app_db_create_all_called(monkeypatch):
    """create_app calls db.create_all() inside app context."""
    called = []

    original_create_all = db.create_all

    def mock_create_all(*args, **kwargs):
        called.append(True)
        return original_create_all(*args, **kwargs)

    monkeypatch.setattr(db, 'create_all', mock_create_all)
    app = create_app('testing')
    assert len(called) >= 1, "db.create_all() should have been called"


def test_create_app_handles_db_exception(monkeypatch, capsys):
    """create_app does NOT raise when db.create_all() throws an exception."""

    def mock_create_all(*args, **kwargs):
        raise Exception("tables already exist")

    monkeypatch.setattr(db, 'create_all', mock_create_all)

    # Must NOT raise - app starts successfully even if DB init fails
    app = create_app('testing')
    assert app is not None

    captured = capsys.readouterr()
    assert "Database initialization note" in captured.out
    assert "tables already exist" in captured.out


def test_create_app_handles_operational_error(monkeypatch):
    """create_app handles OperationalError (tables already exist) gracefully."""
    from sqlalchemy.exc import OperationalError

    def mock_create_all(*args, **kwargs):
        raise OperationalError("table already exists", None, None)

    monkeypatch.setattr(db, 'create_all', mock_create_all)

    # Must NOT raise
    app = create_app('testing')
    assert app is not None


def test_create_app_workers_can_start():
    """Multiple calls to create_app simulate multiple gunicorn workers starting up."""
    # If db.create_all() errors on second call (tables exist), app still starts
    call_count = [0]
    original_create_all = db.create_all

    def mock_create_all(*args, **kwargs):
        call_count[0] += 1
        if call_count[0] > 1:
            raise Exception("relation already exists")
        return original_create_all(*args, **kwargs)

    import app as app_module
    original = db.create_all
    db.create_all = mock_create_all
    try:
        app1 = create_app('testing')
        app2 = create_app('testing')
        assert app1 is not None
        assert app2 is not None
    finally:
        db.create_all = original


def test_create_app_registers_api_blueprint():
    """API blueprint is registered under /api prefix."""
    application = create_app('testing')
    rules = [str(rule) for rule in application.url_map.iter_rules()]
    api_rules = [r for r in rules if r.startswith('/api/')]
    assert len(api_rules) > 0, "At least one /api/ route should be registered"


def test_create_app_health_endpoint():
    """Health endpoint is reachable after app creation."""
    application = create_app('testing')
    client = application.test_client()
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
