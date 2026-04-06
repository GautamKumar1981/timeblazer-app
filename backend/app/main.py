from flask import Flask
from flasgger import Swagger


SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "Timeblazer API",
        "description": "Timeboxing application API",
        "version": "1.0.0",
        "contact": {"email": "api@timeblazer.app"},
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT token: Bearer <token>",
        }
    },
    "security": [{"Bearer": []}],
}

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs/",
}


def register_blueprints(app: Flask):
    from app.api.auth import auth_bp
    from app.api.timeboxes import timeboxes_bp
    from app.api.goals import goals_bp
    from app.api.priorities import priorities_bp
    from app.api.analytics import analytics_bp
    from app.api.reviews import reviews_bp
    from app.api.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(timeboxes_bp, url_prefix="/api/timeboxes")
    app.register_blueprint(goals_bp, url_prefix="/api/goals")
    app.register_blueprint(priorities_bp, url_prefix="/api/priorities")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    Swagger(app, template=SWAGGER_TEMPLATE, config=SWAGGER_CONFIG)

    @app.route("/api/health")
    def health_check():
        from flask import jsonify
        return jsonify({"status": "ok", "service": "timeblazer-api"}), 200
