from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.goal import Goal

goals_bp = Blueprint('goals', __name__, url_prefix='/goals')


def _parse_datetime(value):
    if not value:
        return None
    for fmt in ('%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unable to parse datetime: {value}")


@goals_bp.route('/', methods=['GET'])
@jwt_required()
def list_goals():
    user_id = int(get_jwt_identity())
    query = Goal.query.filter_by(user_id=user_id)

    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    goals = query.order_by(Goal.created_at.desc()).all()
    return jsonify({'goals': [g.to_dict() for g in goals]}), 200


@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400

    target_date = None
    if data.get('target_date'):
        try:
            target_date = _parse_datetime(data['target_date'])
        except ValueError:
            return jsonify({'error': 'Invalid datetime format'}), 400

    goal = Goal(
        title=title,
        description=data.get('description'),
        target_date=target_date,
        status=data.get('status', 'active'),
        progress=data.get('progress', 0),
        user_id=user_id,
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 201


@goals_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_goal(id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_goal(id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    if 'title' in data:
        goal.title = data['title']
    if 'description' in data:
        goal.description = data['description']
    if 'status' in data:
        goal.status = data['status']
    if 'progress' in data:
        goal.progress = data['progress']
    if 'target_date' in data:
        try:
            goal.target_date = _parse_datetime(data['target_date'])
        except ValueError:
            return jsonify({'error': 'Invalid datetime format'}), 400

    goal.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_goal(id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted successfully'}), 200
