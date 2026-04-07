from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import auth, timeboxes, goals, priorities, analytics, reviews  # noqa: E402, F401
