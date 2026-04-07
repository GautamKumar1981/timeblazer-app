from flask import request, jsonify
from app.api import api_bp
from app.services.auth_service import AuthService
from app.services.goal_service import GoalService


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Token is missing'
    token = auth_header.split(' ')[1]
    return AuthService.get_current_user(token)


@api_bp.route('/goals', methods=['GET'])
def list_goals():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    status_filter = request.args.get('status')
    category_filter = request.args.get('category')

    result, status = GoalService.list_goals(user.id, status_filter, category_filter)
    return jsonify(result), status


@api_bp.route('/goals', methods=['POST'])
def create_goal():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    result, status = GoalService.create_goal(user.id, data)
    return jsonify(result), status


@api_bp.route('/goals/<int:goal_id>', methods=['GET'])
def get_goal(goal_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = GoalService.get_goal(user.id, goal_id)
    return jsonify(result), status


@api_bp.route('/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    result, status = GoalService.update_goal(user.id, goal_id, data)
    return jsonify(result), status


@api_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = GoalService.delete_goal(user.id, goal_id)
    return jsonify(result), status
