from flask import Blueprint

api_bp = Blueprint('api', __name__)

from .auth import auth_bp
from .timeboxes import timeboxes_bp
from .goals import goals_bp
from .health import health_bp

api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(timeboxes_bp)
api_bp.register_blueprint(goals_bp)
api_bp.register_blueprint(health_bp)
