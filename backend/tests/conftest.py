import pytest
from app import create_app, db as _db
from app.models.user import User
from app.services.auth_service import hash_password, generate_tokens


@pytest.fixture(scope='session')
def app():
    application = create_app('testing')
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


@pytest.fixture(scope='function')
def db(app):
    with app.app_context():
        _db.session.begin_nested()
        yield _db
        _db.session.rollback()


@pytest.fixture(scope='function')
def sample_user(app):
    with app.app_context():
        user = User(
            email='test@example.com',
            password_hash=hash_password('password123'),
            name='Test User',
        )
        _db.session.add(user)
        _db.session.commit()
        _db.session.refresh(user)
        yield user
        _db.session.delete(user)
        _db.session.commit()


@pytest.fixture(scope='function')
def auth_headers(app, sample_user):
    with app.app_context():
        tokens = generate_tokens(sample_user.id)
        return {'Authorization': f'Bearer {tokens["access_token"]}'}
