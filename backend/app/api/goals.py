from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.goal import Goal
from app.schemas import GoalCreateSchema, GoalUpdateSchema, GoalProgressSchema
from app.services.goal_service import create_goal, calculate_dday, update_progress
from app.utils.decorators import require_json

goals_bp = Blueprint('goals', __name__)


@goals_bp.route('/', methods=['GET'])
@jwt_required()
def list_goals():
    user_id = get_jwt_identity()
    status = request.args.get('status')
    query = Goal.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    goals = query.order_by(Goal.created_at.desc()).all()
    result = []
    for g in goals:
        d = g.to_dict()
        d['days_remaining'] = calculate_dday(g)
        result.append(d)
    return jsonify({'goals': result}), 200


@goals_bp.route('/', methods=['POST'])
@jwt_required()
@require_json
def create_goal_endpoint():
    user_id = get_jwt_identity()
    schema = GoalCreateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    goal = create_goal(user_id, data)
    d = goal.to_dict()
    d['days_remaining'] = calculate_dday(goal)
    return jsonify({'goal': d}), 201


@goals_bp.route('/<goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id: str):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    d = goal.to_dict()
    d['days_remaining'] = calculate_dday(goal)
    return jsonify({'goal': d}), 200


@goals_bp.route('/<goal_id>', methods=['PUT'])
@jwt_required()
@require_json
def update_goal(goal_id: str):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    schema = GoalUpdateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    for field in ('title', 'description', 'target_date', 'priority', 'status', 'progress', 'milestones'):
        if field in data:
            setattr(goal, field, data[field])
    db.session.commit()
    d = goal.to_dict()
    d['days_remaining'] = calculate_dday(goal)
    return jsonify({'goal': d}), 200


@goals_bp.route('/<goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id: str):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted'}), 200


@goals_bp.route('/<goal_id>/progress', methods=['PATCH'])
@jwt_required()
@require_json
def update_goal_progress(goal_id: str):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    schema = GoalProgressSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    updated = update_progress(goal_id, data['progress'])
    d = updated.to_dict()
    d['days_remaining'] = calculate_dday(updated)
    return jsonify({'goal': d}), 200
