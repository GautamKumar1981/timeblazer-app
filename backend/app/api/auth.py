import os
import jwt as pyjwt
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, current_app
from app.api import api_bp
from app.api.utils import get_current_user
from app.services.auth_service import AuthService
from app import db


@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    if not username:
        username = email.split('@')[0]

    result, status = AuthService.register(email, username, password)
    return jsonify(result), status


@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    result, status = AuthService.login(email, password)
    return jsonify(result), status


@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200


@api_bp.route('/auth/me', methods=['GET'])
def me():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401
    return jsonify({'user': user.to_dict()}), 200


@api_bp.route('/auth/profile', methods=['PUT', 'PATCH'])
def update_profile():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json() or {}
    from app.models.user import User

    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Name cannot be empty'}), 400
        user.username = name

    if 'email' in data:
        new_email = data['email'].strip().lower()
        if not new_email:
            return jsonify({'error': 'Email cannot be empty'}), 400
        if new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return jsonify({'error': 'Email already in use'}), 409
            user.email = new_email

    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@api_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    from app.models.user import User
    data  = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'Email required'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        secret  = current_app.config.get('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'))
        token   = pyjwt.encode({
            'purpose': 'password_reset',
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        }, secret, algorithm='HS256')
        app_url   = os.environ.get('APP_URL', 'https://dragonhour.app')
        reset_url = f'{app_url}/reset-password?token={token}'
        try:
            from app.services.email_service import send_reset_email
            send_reset_email(email, user.username, reset_url)
        except Exception as e:
            print(f'[email] Reset email failed for {email}: {e}')

    return jsonify({'message': 'If that email is registered, a reset link has been sent.'}), 200


@api_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    from app.models.user import User
    data         = request.get_json() or {}
    token        = data.get('token', '')
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'error': 'token and new_password are required'}), 400
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    try:
        secret  = current_app.config.get('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret'))
        payload = pyjwt.decode(token, secret, algorithms=['HS256'])
        if payload.get('purpose') != 'password_reset':
            return jsonify({'error': 'Invalid reset token'}), 400
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Reset link has expired. Please request a new one.'}), 400
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid reset link'}), 400


@api_bp.route('/auth/change-password', methods=['POST'])
def change_password():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password     = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'current_password and new_password are required'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200
