from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.schemas import GoalCreateSchema, GoalUpdateSchema
from app.services import GoalService, GoalServiceError
from app.websocket.events import GOAL_CREATED, GOAL_UPDATED
from app.websocket.handlers import emit_to_user

goals_bp = Blueprint("goals", __name__)


@goals_bp.route("/", methods=["GET"])
@jwt_required()
def list_goals():
    """List all goals for the current user.
    ---
    tags: [Goals]
    security:
      - Bearer: []
    responses:
      200:
        description: List of goals
    """
    user_id = int(get_jwt_identity())
    goals = GoalService.get_goals(user_id)
    return jsonify([g.to_dict() for g in goals]), 200


@goals_bp.route("/", methods=["POST"])
@jwt_required()
def create_goal():
    """Create a new goal.
    ---
    tags: [Goals]
    security:
      - Bearer: []
    responses:
      201:
        description: Goal created
      400:
        description: Validation error
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        data = GoalCreateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        goal = GoalService.create_goal(user_id, data)
    except GoalServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = goal.to_dict()
    emit_to_user(user_id, GOAL_CREATED, result)
    return jsonify(result), 201


@goals_bp.route("/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_goal(goal_id):
    """Get a single goal by ID.
    ---
    tags: [Goals]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: goal_id
        type: integer
        required: true
    responses:
      200:
        description: Goal data
      404:
        description: Not found
    """
    user_id = int(get_jwt_identity())
    try:
        goal = GoalService.get_goal(goal_id, user_id)
    except GoalServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code
    return jsonify(goal.to_dict()), 200


@goals_bp.route("/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    """Update a goal.
    ---
    tags: [Goals]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: goal_id
        type: integer
        required: true
    responses:
      200:
        description: Updated goal
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
        data = GoalUpdateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    try:
        goal = GoalService.update_goal(goal_id, user_id, data)
    except GoalServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code

    result = goal.to_dict()
    emit_to_user(user_id, GOAL_UPDATED, result)
    return jsonify(result), 200


@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    """Delete a goal.
    ---
    tags: [Goals]
    security:
      - Bearer: []
    parameters:
      - in: path
        name: goal_id
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
        GoalService.delete_goal(goal_id, user_id)
    except GoalServiceError as exc:
        return jsonify({"error": exc.message}), exc.status_code
    return "", 204
