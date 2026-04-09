from flask import Flask
from app.config import config
from app.extensions import db, cors, socketio, limiter


def create_app(config_name=None):
    import os
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['development']))

    db.init_app(app)
    cors.init_app(app, origins=app.config.get('CORS_ORIGINS', '*'))
    socketio.init_app(app, cors_allowed_origins=app.config.get('CORS_ORIGINS', '*'), async_mode='threading')
    limiter.init_app(app)

    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    with app.app_context():
        # Only create tables if they don't already exist
        inspector = db.inspect(db.engine)
        if not inspector.get_table_names():
            db.create_all()

    return app
