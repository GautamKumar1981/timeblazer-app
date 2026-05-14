import os
from flask import Flask, jsonify, request, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import inspect, text

from app.config import config

db = SQLAlchemy()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)

_db_initialized = False


def _migrate_columns(engine):
    """Add new columns to existing tables that were created before schema updates."""
    try:
        is_sqlite = 'sqlite' in str(engine.url)
        float_type = 'REAL' if is_sqlite else 'DOUBLE PRECISION'
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if 'bazi_profiles' in tables:
            existing = {col['name'] for col in inspector.get_columns('bazi_profiles')}
            new_cols = [
                ('birth_country',  "VARCHAR(100) DEFAULT ''"),
                ('birth_city',     "VARCHAR(100) DEFAULT ''"),
                ('birth_lat',      float_type),
                ('birth_lon',      float_type),
                ('moon_rashi',     "VARCHAR(50) DEFAULT ''"),
                ('moon_nakshatra', "VARCHAR(100) DEFAULT ''"),
                ('moon_longitude', float_type),
            ]
            with engine.connect() as conn:
                for col_name, col_def in new_cols:
                    if col_name not in existing:
                        conn.execute(text(f'ALTER TABLE bazi_profiles ADD COLUMN {col_name} {col_def}'))
                conn.commit()
    except Exception as e:
        print(f"Migration warning: {e}")


def create_app(config_name=None):
    if config_name is None:
        # If DATABASE_URL is present we're on a real server — use production config.
        if os.environ.get('DATABASE_URL'):
            config_name = 'production'
        else:
            config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['development']))

    db.init_app(app)
    cors_origins = app.config.get('CORS_ORIGINS', '*')
    CORS(app, origins=cors_origins,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
    socketio.init_app(app, cors_allowed_origins=cors_origins, async_mode='threading')
    limiter.init_app(app)

    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Health check — must respond instantly with no DB dependency.
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    # Ensure every response carries CORS headers — belt-and-braces alongside Flask-CORS.
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Origin']  = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response.headers['Vary'] = 'Origin'
        return response

    # Explicitly handle OPTIONS preflight before any other logic runs.
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            res = Response()
            origin = request.headers.get('Origin', '*')
            res.headers['Access-Control-Allow-Origin']  = origin
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            res.headers['Access-Control-Max-Age']       = '86400'
            res.headers['Vary'] = 'Origin'
            return res, 200

    # Lazy DB init: runs on the first real request, not at startup.
    @app.before_request
    def init_db_once():
        global _db_initialized
        if not _db_initialized:
            try:
                db.create_all()
                _migrate_columns(db.engine)
                _db_initialized = True
            except Exception as e:
                print(f"DB init warning: {e}")

    return app
