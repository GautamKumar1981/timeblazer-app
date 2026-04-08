from flask import request
from app.services.auth_service import AuthService


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Token is missing'
    token = auth_header.split(' ')[1]
    return AuthService.get_current_user(token)
