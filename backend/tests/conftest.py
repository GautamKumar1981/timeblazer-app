import pytest

from app import create_app, db as _db
from app.config import TestingConfig
from app.models.user import User


@pytest.fixture(scope="session")
def app():
    """Create application for testing."""
    application = create_app(TestingConfig)
    return application


@pytest.fixture(scope="session")
def db(app):
    """Create database for testing session."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app, db):
    """Test client with clean database for each test."""
    with app.app_context():
        # Clean tables between tests
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()

        with app.test_client() as c:
            yield c


@pytest.fixture(scope="function")
def sample_user(db, app):
    """Create and return a sample user."""
    with app.app_context():
        user = User(email="test@example.com", name="Test User", timezone="UTC")
        user.set_password("password123")
        _db.session.add(user)
        _db.session.commit()
        _db.session.refresh(user)
        return user


@pytest.fixture(scope="function")
def auth_headers(client, sample_user):
    """Return Authorization headers for the sample user."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert resp.status_code == 200
    token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
