from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.config import config

db = SQLAlchemy()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_name=None):
    import os
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['development']))

    db.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))
    socketio.init_app(app, cors_allowed_origins=app.config.get('CORS_ORIGINS', '*'), async_mode='threading')
    limiter.init_app(app)

    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app
