from app.api.auth import auth_bp
from app.api.timeboxes import timeboxes_bp
from app.api.goals import goals_bp
from app.api.priorities import priorities_bp
from app.api.analytics import analytics_bp
from app.api.reviews import reviews_bp
from app.api.users import users_bp

__all__ = [
    "auth_bp",
    "timeboxes_bp",
    "goals_bp",
    "priorities_bp",
    "analytics_bp",
    "reviews_bp",
    "users_bp",
]
