from flask import request, jsonify
from app.extensions import db
from app.models import Goal
from app.api import api_bp
from app.api.auth import token_required


@api_bp.route('/goals', methods=['GET'])
@token_required
def get_goals(current_user):
    goals = Goal.query.filter_by(user_id=current_user.id).order_by(Goal.created_at.desc()).all()
    return jsonify({'goals': [g.to_dict() for g in goals]}), 200


@api_bp.route('/goals', methods=['POST'])
@token_required
def create_goal(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    goal = Goal(
        user_id=current_user.id,
        title=title,
        description=data.get('description', ''),
        status=data.get('status', 'active'),
        progress=data.get('progress', 0),
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 201


@api_bp.route('/goals/<int:goal_id>', methods=['GET'])
@token_required
def get_goal(current_user, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    return jsonify({'goal': goal.to_dict()}), 200


@api_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@token_required
def update_goal(current_user, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'title' in data:
        goal.title = data['title'].strip()
    if 'description' in data:
        goal.description = data['description']
    if 'status' in data:
        goal.status = data['status']
    if 'progress' in data:
        goal.progress = data['progress']

    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@api_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@token_required
def delete_goal(current_user, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted'}), 200
