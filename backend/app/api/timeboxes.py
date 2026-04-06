from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.schemas import (
    TimeboxCreateSchema,
    TimeboxUpdateSchema,
    TimeboxStatusSchema,
    TimeboxCompleteSchema,
)
from app.services import TimeboxService, TimeboxServiceError
from app.websocket.events import TIMEBOX_CREATED, TIMEBOX_UPDATED, TIMEBOX_DELETED
from app.websocket.handlers import emit_to_user

timeboxes_bp = Blueprint("timeboxes", __name__)


@timeboxes_bp.route("/", methods=["GET"])
@jwt_required()
def list_timeboxes():
    """List timeboxes with optional filters.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: query
        name: date
        type: string
        description: Filter by date (YYYY-MM-DD)
      - in: query
        name: status
        type: string
      - in: query
        name: category
        type: string
    responses:
      200:
        description: List of timeboxes
    """
    user_id = int(get_jwt_identity())
    date_param = request.args.get("date")
    status_param = request.args.get("status")
    category_param = request.args.get("category")

    date_filter = None
    if date_param:
        try:
            date_filter = date.fromisoformat(date_param)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    timeboxes = TimeboxService.get_timeboxes(
        user_id=user_id,
        date_filter=date_filter,
        status=status_param,
        category=category_param,
    )
    return jsonify([t.to_dict() for t in timeboxes]), 200


@timeboxes_bp.route("/", methods=["POST"])
@jwt_required()
def create_timebox():
    """Create a new timebox.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    responses:
      201:
        description: Timebox created
      400:
        description: Validation error
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = TimeboxCreateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        timebox = TimeboxService.create_timebox(user_id, data)
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = timebox.to_dict()
    emit_to_user(user_id, TIMEBOX_CREATED, result)
    return jsonify(result), 201


@timeboxes_bp.route("/<int:timebox_id>", methods=["GET"])
@jwt_required()
def get_timebox(timebox_id):
    """Get a single timebox by ID.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: timebox_id
        type: integer
        required: true
    responses:
      200:
        description: Timebox data
      404:
        description: Not found
    """
    user_id = int(get_jwt_identity())
    try:
        timebox = TimeboxService.get_timebox(timebox_id, user_id)
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code
    return jsonify(timebox.to_dict()), 200


@timeboxes_bp.route("/<int:timebox_id>", methods=["PUT"])
@jwt_required()
def update_timebox(timebox_id):
    """Update a timebox.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: timebox_id
        type: integer
        required: true
    responses:
      200:
        description: Updated timebox
      400:
        description: Validation error
      404:
        description: Not found
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = TimeboxUpdateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        timebox = TimeboxService.update_timebox(timebox_id, user_id, data)
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = timebox.to_dict()
    emit_to_user(user_id, TIMEBOX_UPDATED, result)
    return jsonify(result), 200


@timeboxes_bp.route("/<int:timebox_id>", methods=["DELETE"])
@jwt_required()
def delete_timebox(timebox_id):
    """Delete a timebox.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: timebox_id
        type: integer
        required: true
    responses:
      204:
        description: Deleted
      404:
        description: Not found
    """
    user_id = int(get_jwt_identity())
    try:
        TimeboxService.delete_timebox(timebox_id, user_id)
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    emit_to_user(user_id, TIMEBOX_DELETED, {"timebox_id": timebox_id})
    return "", 204


@timeboxes_bp.route("/<int:timebox_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(timebox_id):
    """Update timebox status.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: timebox_id
        type: integer
        required: true
    responses:
      200:
        description: Updated timebox
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = TimeboxStatusSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        timebox = TimeboxService.update_status(timebox_id, user_id, data["status"])
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = timebox.to_dict()
    emit_to_user(user_id, TIMEBOX_UPDATED, result)
    return jsonify(result), 200


@timeboxes_bp.route("/<int:timebox_id>/complete", methods=["POST"])
@jwt_required()
def complete_timebox(timebox_id):
    """Mark a timebox as completed.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: timebox_id
        type: integer
        required: true
    responses:
      200:
        description: Completed timebox
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True) or {}

    try:
        data = TimeboxCompleteSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        timebox = TimeboxService.complete_timebox(
            timebox_id, user_id, actual_duration=data.get("actual_duration")
        )
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = timebox.to_dict()
    emit_to_user(user_id, TIMEBOX_UPDATED, result)
    return jsonify(result), 200


@timeboxes_bp.route("/batch", methods=["POST"])
@jwt_required()
def create_batch():
    """Create multiple timeboxes at once.
    ---
    tags: [Timeboxes]
    security:
      - Bearer: []
    responses:
      201:
        description: Timeboxes created
      400:
        description: Validation error
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data or not isinstance(json_data, list):
        return jsonify({"error": "Request body must be a JSON array of timeboxes"}), 400

    schema = TimeboxCreateSchema()
    validated = []
    errors = []
    for i, item in enumerate(json_data):
        try:
            validated.append(schema.load(item))
        except ValidationError as exc:
            errors.append({"index": i, "errors": exc.messages})

    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    try:
        timeboxes = TimeboxService.create_batch(user_id, validated)
    except TimeboxServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    results = [t.to_dict() for t in timeboxes]
    for result in results:
        emit_to_user(user_id, TIMEBOX_CREATED, result)
    return jsonify(results), 201
