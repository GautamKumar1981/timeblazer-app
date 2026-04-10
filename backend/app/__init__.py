from flask import Flask
from .extensions import db, jwt, socketio, limiter, cors
from .api import api_bp
from config import Config


def create_app(config_object=None):
    app = Flask(__name__)

    if config_object is not None:
        app.config.from_object(config_object)
    else:
        app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    limiter.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api_bp, url_prefix='/api')

    with app.app_context():
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            if not inspector.get_table_names():
                db.create_all()
        except Exception as e:
            app.logger.warning(f"DB init warning: {e}")

    return app
