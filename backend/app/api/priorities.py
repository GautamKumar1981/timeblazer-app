from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.daily_priority import DailyPriority
from app.schemas import PriorityCreateSchema, PriorityUpdateSchema
from app.websocket.events import PRIORITY_CHANGED
from app.websocket.handlers import emit_to_user

priorities_bp = Blueprint("priorities", __name__)


@priorities_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today():
    """Get today's daily priorities.
    ---
    tags: [Priorities]
    security:
      - Bearer: []
    responses:
      200:
        description: Today's priorities (or empty object if none set)
    """
    user_id = int(get_jwt_identity())
    today = date.today()
    priority = DailyPriority.query.filter_by(user_id=user_id, date=today).first()
    if not priority:
        return jsonify({}), 200
    return jsonify(priority.to_dict()), 200


@priorities_bp.route("/", methods=["POST"])
@jwt_required()
def create_or_update_priority():
    """Create or update daily priorities (upsert by date).
    ---
    tags: [Priorities]
    security:
      - Bearer: []
    responses:
      200:
        description: Updated priorities
      201:
        description: Created priorities
      400:
        description: Validation error
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = PriorityCreateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    target_date = data.get("date") or date.today()
    existing = DailyPriority.query.filter_by(user_id=user_id, date=target_date).first()

    if existing:
        for field in ["priority_1", "priority_2", "priority_3", "completion_status"]:
            if field in data and data[field] is not None:
                setattr(existing, field, data[field])
        db.session.commit()
        result = existing.to_dict()
        emit_to_user(user_id, PRIORITY_CHANGED, result)
        return jsonify(result), 200
    else:
        priority = DailyPriority(
            user_id=user_id,
            date=target_date,
            priority_1=data.get("priority_1"),
            priority_2=data.get("priority_2"),
            priority_3=data.get("priority_3"),
            completion_status=data.get("completion_status", 0),
        )
        db.session.add(priority)
        db.session.commit()
        result = priority.to_dict()
        emit_to_user(user_id, PRIORITY_CHANGED, result)
        return jsonify(result), 201


@priorities_bp.route("/<int:priority_id>", methods=["PUT"])
@jwt_required()
def update_priority(priority_id):
    """Update an existing daily priority record.
    ---
    tags: [Priorities]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: priority_id
        type: integer
        required: true
    responses:
      200:
        description: Updated priority
      400:
        description: Validation error
      404:
        description: Not found
    """
    user_id = int(get_jwt_identity())
    priority = DailyPriority.query.filter_by(id=priority_id, user_id=user_id).first()
    if not priority:
        return jsonify({"error": "Priority not found"}), 404

    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = PriorityUpdateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    for field in ["priority_1", "priority_2", "priority_3", "completion_status"]:
        if field in data:
            setattr(priority, field, data[field])

    db.session.commit()
    result = priority.to_dict()
    emit_to_user(user_id, PRIORITY_CHANGED, result)
    return jsonify(result), 200
