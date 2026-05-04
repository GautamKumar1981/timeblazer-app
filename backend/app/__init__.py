import os
from flask import Flask, jsonify, request, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.config import config

db = SQLAlchemy()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)

_db_initialized = False


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

    # Explicitly handle OPTIONS preflight before any other logic runs.
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            res = Response()
            res.headers['Access-Control-Allow-Origin']  = '*'
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            res.headers['Access-Control-Max-Age']       = '86400'
            return res, 200

    # Lazy DB init: runs on the first real request, not at startup.
    @app.before_request
    def init_db_once():
        global _db_initialized
        if not _db_initialized:
            try:
                db.create_all()
                _db_initialized = True
            except Exception as e:
                print(f"DB init warning: {e}")

    return app
