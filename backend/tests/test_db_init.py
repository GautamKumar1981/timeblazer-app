from app import create_app
from app.extensions import db as _db
from config import TestingConfig


def test_db_creates_tables():
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        from sqlalchemy import inspect
        inspector = inspect(_db.engine)
        tables = inspector.get_table_names()
        assert len(tables) > 0
        _db.drop_all()


def test_db_tables_exist():
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        from sqlalchemy import inspect
        inspector = inspect(_db.engine)
        tables = inspector.get_table_names()
        assert 'user' in tables
        assert 'timebox' in tables
        assert 'goal' in tables
        _db.drop_all()
