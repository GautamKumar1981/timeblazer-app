from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app.services.auth_service import AuthService


@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not email or not username or not password:
        return jsonify({'error': 'email, username and password are required'}), 400

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
