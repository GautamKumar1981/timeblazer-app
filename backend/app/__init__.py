from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_name: str = 'development') -> Flask:
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins=app.config['CORS_ORIGINS'], async_mode='eventlet')
    limiter.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.timeboxes import timeboxes_bp
    from app.api.goals import goals_bp
    from app.api.priorities import priorities_bp
    from app.api.analytics import analytics_bp
    from app.api.reviews import reviews_bp
    from app.api.users import users_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(timeboxes_bp, url_prefix='/api/timeboxes')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(priorities_bp, url_prefix='/api/priorities')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    # Register WebSocket handlers
    from app.websocket import handlers  # noqa: F401

    return app
