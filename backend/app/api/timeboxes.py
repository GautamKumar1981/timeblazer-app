from flask import request, jsonify
from app.extensions import db
from app.models import Timebox
from app.api import api_bp
from app.api.auth import token_required


@api_bp.route('/timeboxes', methods=['GET'])
@token_required
def get_timeboxes(current_user):
    timeboxes = Timebox.query.filter_by(user_id=current_user.id).order_by(Timebox.created_at.desc()).all()
    return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200


@api_bp.route('/timeboxes', methods=['POST'])
@token_required
def create_timebox(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    timebox = Timebox(
        user_id=current_user.id,
        title=title,
        description=data.get('description', ''),
        duration_minutes=data.get('duration_minutes', 25),
        status=data.get('status', 'pending'),
    )
    db.session.add(timebox)
    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 201


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['GET'])
@token_required
def get_timebox(current_user, timebox_id):
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=current_user.id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404
    return jsonify({'timebox': timebox.to_dict()}), 200


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['PUT'])
@token_required
def update_timebox(current_user, timebox_id):
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=current_user.id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'title' in data:
        timebox.title = data['title'].strip()
    if 'description' in data:
        timebox.description = data['description']
    if 'duration_minutes' in data:
        timebox.duration_minutes = data['duration_minutes']
    if 'status' in data:
        timebox.status = data['status']

    db.session.commit()
    return jsonify({'timebox': timebox.to_dict()}), 200


@api_bp.route('/timeboxes/<int:timebox_id>', methods=['DELETE'])
@token_required
def delete_timebox(current_user, timebox_id):
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=current_user.id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    db.session.delete(timebox)
    db.session.commit()
    return jsonify({'message': 'Timebox deleted'}), 200
