import jwt
import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from app import db
from app.models.user import User


class AuthService:

    @staticmethod
    def register(email: str, username: str, password: str):
        if User.query.filter_by(email=email).first():
            return {'error': 'Email already registered'}, 409

        if User.query.filter_by(username=username).first():
            return {'error': 'Username already taken'}, 409

        if len(password) < 8:
            return {'error': 'Password must be at least 8 characters'}, 400

        user = User(email=email, username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        token = AuthService._generate_token(user.id)
        return {'user': user.to_dict(), 'token': token}, 201

    @staticmethod
    def login(email: str, password: str):
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {'error': 'Invalid email or password'}, 401

        token = AuthService._generate_token(user.id)
        return {'user': user.to_dict(), 'token': token}, 200

    @staticmethod
    def get_current_user(token: str):
        try:
            secret = current_app.config.get('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'))
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            if not user:
                return None, 'User not found'
            return user, None
        except jwt.ExpiredSignatureError:
            return None, 'Token has expired'
        except jwt.InvalidTokenError:
            return None, 'Invalid token'

    @staticmethod
    def _generate_token(user_id: int) -> str:
        secret = current_app.config.get('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'))
        exp_hours = current_app.config.get('JWT_EXPIRATION_HOURS', 24)
        payload = {
            'user_id': user_id,
            'exp': datetime.now(timezone.utc) + timedelta(hours=exp_hours),
            'iat': datetime.now(timezone.utc),
        }
        return jwt.encode(payload, secret, algorithm='HS256')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        user, error = AuthService.get_current_user(token)
        if error:
            return jsonify({'error': error}), 401

        return f(user, *args, **kwargs)
    return decorated
