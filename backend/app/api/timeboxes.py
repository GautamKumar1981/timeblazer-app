from datetime import date, datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.timebox import Timebox
from app.schemas import TimeboxCreateSchema, TimeboxUpdateSchema, TimeboxStatusSchema
from app.services import timebox_service
from app.utils.decorators import require_json
from app.websocket.handlers import emit_timebox_update
from app.websocket.events import TIMEBOX_CREATED, TIMEBOX_UPDATED, TIMEBOX_STARTED, TIMEBOX_COMPLETED

timeboxes_bp = Blueprint('timeboxes', __name__)


@timeboxes_bp.route('/', methods=['GET'])
@jwt_required()
def list_timeboxes():
    user_id = get_jwt_identity()
    date_str = request.args.get('date')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = Timebox.query.filter_by(user_id=user_id)

    if date_str:
        try:
            target_date = date.fromisoformat(date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        timeboxes = timebox_service.get_timeboxes_for_date(user_id, target_date)
        return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200

    if start_date_str:
        try:
            start_dt = datetime.fromisoformat(start_date_str)
            query = query.filter(Timebox.start_time >= start_dt)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400

    if end_date_str:
        try:
            end_dt = datetime.fromisoformat(end_date_str)
            query = query.filter(Timebox.start_time <= end_dt)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400

    timeboxes = query.order_by(Timebox.start_time).all()
    return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200


@timeboxes_bp.route('/', methods=['POST'])
@jwt_required()
@require_json
def create_timebox():
    user_id = get_jwt_identity()
    schema = TimeboxCreateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    if data['end_time'] <= data['start_time']:
        return jsonify({'error': 'end_time must be after start_time'}), 422

    timebox = timebox_service.create_timebox(user_id, data)
    emit_timebox_update(user_id, TIMEBOX_CREATED, timebox.to_dict())
    return jsonify({'timebox': timebox.to_dict()}), 201


@timeboxes_bp.route('/<timebox_id>', methods=['GET'])
@jwt_required()
def get_timebox(timebox_id: str):
    user_id = get_jwt_identity()
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404
    return jsonify({'timebox': timebox.to_dict()}), 200


@timeboxes_bp.route('/<timebox_id>', methods=['PUT'])
@jwt_required()
@require_json
def update_timebox(timebox_id: str):
    user_id = get_jwt_identity()
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    schema = TimeboxUpdateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    updated = timebox_service.update_timebox(timebox_id, data)
    emit_timebox_update(user_id, TIMEBOX_UPDATED, updated.to_dict())
    return jsonify({'timebox': updated.to_dict()}), 200


@timeboxes_bp.route('/<timebox_id>', methods=['DELETE'])
@jwt_required()
def delete_timebox(timebox_id: str):
    user_id = get_jwt_identity()
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404
    db.session.delete(timebox)
    db.session.commit()
    return jsonify({'message': 'Timebox deleted'}), 200


@timeboxes_bp.route('/<timebox_id>/status', methods=['PATCH'])
@jwt_required()
@require_json
def update_status(timebox_id: str):
    user_id = get_jwt_identity()
    timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
    if not timebox:
        return jsonify({'error': 'Timebox not found'}), 404

    schema = TimeboxStatusSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    updated = timebox_service.update_timebox(timebox_id, data)
    status = data['status']
    if status == 'active':
        event = TIMEBOX_STARTED
    elif status == 'completed':
        event = TIMEBOX_COMPLETED
    else:
        event = TIMEBOX_UPDATED
    emit_timebox_update(user_id, event, updated.to_dict())
    return jsonify({'timebox': updated.to_dict()}), 200


@timeboxes_bp.route('/batch', methods=['POST'])
@jwt_required()
@require_json
def batch_create():
    user_id = get_jwt_identity()
    payload = request.get_json()
    if not isinstance(payload, list):
        return jsonify({'error': 'Expected a list of timeboxes'}), 422

    schema = TimeboxCreateSchema()
    created = []
    errors = []
    for idx, item in enumerate(payload):
        try:
            data = schema.load(item)
        except ValidationError as e:
            errors.append({'index': idx, 'details': e.messages})
            continue
        if data['end_time'] <= data['start_time']:
            errors.append({'index': idx, 'details': 'end_time must be after start_time'})
            continue
        timebox = timebox_service.create_timebox(user_id, data)
        created.append(timebox.to_dict())

    return jsonify({'created': created, 'errors': errors}), 207 if errors else 201
