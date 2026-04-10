from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.timebox import Timebox

timeboxes_bp = Blueprint('timeboxes', __name__, url_prefix='/timeboxes')


def _parse_datetime(value):
    if not value:
        return None
    for fmt in ('%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unable to parse datetime: {value}")


@timeboxes_bp.route('/', methods=['GET'])
@jwt_required()
def list_timeboxes():
    user_id = int(get_jwt_identity())
    query = Timebox.query.filter_by(user_id=user_id)

    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    goal_id = request.args.get('goal_id')
    if goal_id:
        query = query.filter_by(goal_id=int(goal_id))

    date_str = request.args.get('date')
    if date_str:
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d')
            next_day = date.replace(hour=23, minute=59, second=59)
            query = query.filter(
                Timebox.start_time >= date,
                Timebox.start_time <= next_day,
            )
        except ValueError:
            return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    timeboxes = query.order_by(Timebox.start_time).all()
    return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200


@timeboxes_bp.route('/', methods=['POST'])
@jwt_required()
def create_timebox():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    title = data.get('title', '').strip()
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    if not title or not start_time_str or not end_time_str:
        return jsonify({'error': 'title, start_time, and end_time are required'}), 400

    try:
        start_time = _parse_datetime(start_time_str)
        end_time = _parse_datetime(end_time_str)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    timebox = Timebox(
        title=title,
        description=data.get('description'),
        start_time=start_time,
        end_time=end_time,
        status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium'),
        user_id=user_id,
        goal_id=data.get('goal_id'),
    )
    db.session.add(timebox)
    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 201


@timeboxes_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_timebox(id):
    user_id = int(get_jwt_identity())
    timebox = Timebox.query.filter_by(id=id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404
    return jsonify({'timebox': timebox.to_dict()}), 200


@timeboxes_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_timebox(id):
    user_id = int(get_jwt_identity())
    timebox = Timebox.query.filter_by(id=id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    if 'title' in data:
        timebox.title = data['title']
    if 'description' in data:
        timebox.description = data['description']
    if 'status' in data:
        timebox.status = data['status']
    if 'priority' in data:
        timebox.priority = data['priority']
    if 'goal_id' in data:
        timebox.goal_id = data['goal_id']
    if 'start_time' in data:
        try:
            timebox.start_time = _parse_datetime(data['start_time'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    if 'end_time' in data:
        try:
            timebox.end_time = _parse_datetime(data['end_time'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    timebox.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 200


@timeboxes_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_timebox(id):
    user_id = int(get_jwt_identity())
    timebox = Timebox.query.filter_by(id=id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404
    db.session.delete(timebox)
    db.session.commit()
    return jsonify({'message': 'Timebox deleted successfully'}), 200
