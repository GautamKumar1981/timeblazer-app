from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app.services.timebox_service import TimeboxService


@api_bp.route('/timeboxes', methods=['GET'])
def list_timeboxes():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    date_filter = request.args.get('date')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    result, status = TimeboxService.list_timeboxes(user.id, date_filter, start_date, end_date)
    return jsonify(result), status


@api_bp.route('/timeboxes', methods=['POST'])
def create_timebox():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    result, status = TimeboxService.create_timebox(user.id, data)
    return jsonify(result), status


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['GET'])
def get_timebox(timebox_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = TimeboxService.get_timebox(user.id, timebox_id)
    return jsonify(result), status


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['PUT'])
def update_timebox(timebox_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    result, status = TimeboxService.update_timebox(user.id, timebox_id, data)
    return jsonify(result), status


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['DELETE'])
def delete_timebox(timebox_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = TimeboxService.delete_timebox(user.id, timebox_id)
    return jsonify(result), status


@api_bp.route('/timeboxes/<int:timebox_id>/complete', methods=['POST'])
def complete_timebox(timebox_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = TimeboxService.complete_timebox(user.id, timebox_id)
    return jsonify(result), status
