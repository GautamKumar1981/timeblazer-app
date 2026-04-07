from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.schemas import UserRegistrationSchema, UserLoginSchema
from app.services.auth_service import hash_password, verify_password, generate_tokens
from app.utils.decorators import require_json

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@require_json
def register():
    schema = UserRegistrationSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        email=data['email'],
        password_hash=hash_password(data['password']),
        name=data['name'],
        timezone=data.get('timezone', 'UTC'),
    )
    db.session.add(user)
    db.session.commit()

    tokens = generate_tokens(user.id)
    return jsonify({'user': user.to_dict(), **tokens}), 201


@auth_bp.route('/login', methods=['POST'])
@require_json
def login():
    schema = UserLoginSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    user = User.query.filter_by(email=data['email']).first()
    if not user or not verify_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401

    tokens = generate_tokens(user.id)
    return jsonify({'user': user.to_dict(), **tokens}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Successfully logged out'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
