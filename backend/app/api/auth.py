from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from app import token_blocklist
from app.schemas import UserRegisterSchema, UserLoginSchema
from app.services import AuthService, AuthServiceError

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user.
    ---
    tags: [Auth]
    parameters:
      - in: body
        required: true
        schema:
          properties:
            email: {type: string}
            password: {type: string}
            name: {type: string}
            timezone: {type: string}
    responses:
      201:
        description: User registered successfully
      400:
        description: Validation error
      409:
        description: Email already registered
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    schema = UserRegisterSchema()
    try:
        data = schema.load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        result = AuthService.register_user(
            email=data["email"],
            password=data["password"],
            name=data["name"],
            timezone=data.get("timezone", "UTC"),
        )
    except AuthServiceError as exc:
        return jsonify({"error": str(exc)}), exc.status_code

    return jsonify(result), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with email and password.
    ---
    tags: [Auth]
    parameters:
      - in: body
        required: true
        schema:
          properties:
            email: {type: string}
            password: {type: string}
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    schema = UserLoginSchema()
    try:
        data = schema.load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        result = AuthService.login_user(email=data["email"], password=data["password"])
    except AuthServiceError as exc:
        return jsonify({"error": str(exc)}), exc.status_code

    return jsonify(result), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using a refresh token.
    ---
    tags: [Auth]
    security:
      - Bearer: []
    responses:
      200:
        description: New access token
      401:
        description: Invalid or expired refresh token
    """
    identity = get_jwt_identity()
    result = AuthService.refresh_token(identity)
    return jsonify(result), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout by revoking the current access token.
    ---
    tags: [Auth]
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
    """
    jti = get_jwt()["jti"]
    token_blocklist.add(jti)
    return jsonify({"message": "Successfully logged out"}), 200
