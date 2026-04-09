from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import auth, timeboxes, goals, health  # noqa: F401, E402
