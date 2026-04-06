from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.schemas import UserUpdateSchema

users_bp = Blueprint("users", __name__)


@users_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    """Get current user's settings/profile.
    ---
    tags: [Users]
    security:
      - Bearer: []
    responses:
      200:
        description: User settings
      404:
        description: User not found
    """
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@users_bp.route("/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    """Update current user's settings/profile.
    ---
    tags: [Users]
    security:
      - Bearer: []
    responses:
      200:
        description: Updated user settings
      400:
        description: Validation error
      404:
        description: User not found
    """
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = UserUpdateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    allowed_fields = ["name", "timezone", "profile_picture_url", "theme"]
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    from datetime import datetime, timezone
    user.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(user.to_dict()), 200
