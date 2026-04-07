import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from typing import Optional


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against its hash."""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def generate_tokens(user_id: str) -> dict:
    """Generate access and refresh tokens for a user."""
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
    }


def validate_token(token: str) -> Optional[str]:
    """Decode and validate a JWT token, returning the user_id or None."""
    try:
        decoded = decode_token(token)
        return decoded.get('sub')
    except Exception:
        return None
