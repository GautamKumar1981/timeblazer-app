from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import api_bp
from app.extensions import db
from app.models import Goal


@api_bp.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=user_id).order_by(Goal.created_at).all()
    return jsonify({'goals': [g.to_dict() for g in goals]}), 200


@api_bp.route('/goals', methods=['POST'])
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
            target_date = datetime.fromisoformat(data['target_date'])
        except ValueError:
            return jsonify({'error': 'Invalid target_date format'}), 400

    goal = Goal(
        user_id=user_id,
        title=title,
        description=data.get('description'),
        target_date=target_date,
        completed=data.get('completed', False),
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 201


@api_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    if 'title' in data:
        goal.title = data['title'].strip()
    if 'description' in data:
        goal.description = data['description']
    if 'target_date' in data:
        if data['target_date']:
            try:
                goal.target_date = datetime.fromisoformat(data['target_date'])
            except ValueError:
                return jsonify({'error': 'Invalid target_date format'}), 400
        else:
            goal.target_date = None
    if 'completed' in data:
        goal.completed = bool(data['completed'])

    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@api_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted'}), 200
