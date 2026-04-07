from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.schemas import UserUpdateSchema, PasswordChangeSchema
from app.services.auth_service import hash_password, verify_password
from app.utils.decorators import require_json

users_bp = Blueprint('users', __name__)


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
@require_json
def update_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    schema = UserUpdateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    for field in ('name', 'timezone', 'theme', 'notifications_enabled'):
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/password', methods=['PUT'])
@jwt_required()
@require_json
def change_password():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    schema = PasswordChangeSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    if not verify_password(data['current_password'], user.password_hash):
        return jsonify({'error': 'Current password is incorrect'}), 401

    user.password_hash = hash_password(data['new_password'])
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200


@users_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200
