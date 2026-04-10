import os
from flask import Flask
from flask_cors import CORS
from app.config import config
from app.extensions import db, jwt, socketio, limiter


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['development']))

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))
    socketio.init_app(app, cors_allowed_origins=app.config.get('CORS_ORIGINS', '*'), async_mode='threading')
    limiter.init_app(app)

    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    with app.app_context():
        try:
            # Safely create tables - ignore if they already exist
            db.create_all()
        except Exception as e:
            # Log but don't crash - tables might already exist
            print(f"Database initialization note: {str(e)}")

    return app
