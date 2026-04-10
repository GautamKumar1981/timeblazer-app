from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import api_bp
from app.extensions import db
from app.models import Timebox


@api_bp.route('/timeboxes', methods=['GET'])
@jwt_required()
def get_timeboxes():
    user_id = int(get_jwt_identity())
    timeboxes = Timebox.query.filter_by(user_id=user_id).order_by(Timebox.start_time).all()
    return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200


@api_bp.route('/timeboxes', methods=['POST'])
@jwt_required()
def create_timebox():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    title = data.get('title', '').strip()
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not title or not start_time or not end_time:
        return jsonify({'error': 'title, start_time, and end_time are required'}), 400

    try:
        start_dt = datetime.fromisoformat(start_time)
        end_dt = datetime.fromisoformat(end_time)
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400

    timebox = Timebox(
        user_id=user_id,
        title=title,
        description=data.get('description'),
        start_time=start_dt,
        end_time=end_dt,
        completed=data.get('completed', False),
    )
    db.session.add(timebox)
    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 201


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['PUT'])
@jwt_required()
def update_timebox(timebox_id):
    user_id = int(get_jwt_identity())
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    if 'title' in data:
        timebox.title = data['title'].strip()
    if 'description' in data:
        timebox.description = data['description']
    if 'start_time' in data:
        try:
            timebox.start_time = datetime.fromisoformat(data['start_time'])
        except ValueError:
            return jsonify({'error': 'Invalid start_time format'}), 400
    if 'end_time' in data:
        try:
            timebox.end_time = datetime.fromisoformat(data['end_time'])
        except ValueError:
            return jsonify({'error': 'Invalid end_time format'}), 400
    if 'completed' in data:
        timebox.completed = bool(data['completed'])

    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 200


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['DELETE'])
@jwt_required()
def delete_timebox(timebox_id):
    user_id = int(get_jwt_identity())
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    db.session.delete(timebox)
    db.session.commit()
    return jsonify({'message': 'Timebox deleted'}), 200
