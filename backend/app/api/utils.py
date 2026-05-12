from functools import wraps
from flask import request, jsonify
from app.services.auth_service import AuthService


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Token is missing'
    token = auth_header.split(' ')[1]
    return AuthService.get_current_user(token)


def admin_required(f):
    """Decorator: requires a valid token AND user.is_admin == True."""
    @wraps(f)
    def decorated(*args, **kwargs):
        user, error = get_current_user()
        if error:
            return jsonify({'error': error}), 401
        if not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(user, *args, **kwargs)
    return decorated
