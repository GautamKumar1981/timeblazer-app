from datetime import datetime, timezone

from flask_jwt_extended import create_access_token, create_refresh_token

from app import db
from app.models.user import User


class AuthServiceError(Exception):
    """Raised for authentication-related business logic errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AuthService:
    @staticmethod
    def register_user(email: str, password: str, name: str, timezone: str = "UTC") -> dict:
        """Create a new user, returning JWT tokens on success."""
        existing = User.query.filter_by(email=email.lower().strip()).first()
        if existing:
            raise AuthServiceError("Email already registered", 409)

        user = User(
            email=email.lower().strip(),
            name=name.strip(),
            timezone=timezone,
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    @staticmethod
    def login_user(email: str, password: str) -> dict:
        """Validate credentials and return JWT tokens."""
        user = User.query.filter_by(email=email.lower().strip()).first()
        if not user or not user.check_password(password):
            raise AuthServiceError("Invalid email or password", 401)

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    @staticmethod
    def refresh_token(identity: str) -> dict:
        """Generate a new access token for an existing identity."""
        access_token = create_access_token(identity=identity)
        return {"access_token": access_token}

    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        """Fetch a user by primary key; raises 404 if not found."""
        user = db.session.get(User, user_id)
        if not user:
            raise AuthServiceError("User not found", 404)
        return user
