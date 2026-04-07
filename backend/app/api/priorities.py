from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from app import db
from app.models.daily_priority import DailyPriority
from app.utils.decorators import require_json

priorities_bp = Blueprint('priorities', __name__)


class DailyPrioritySchema(Schema):
    date = fields.Date(load_default=None)
    priority_1 = fields.Str(allow_none=True)
    priority_2 = fields.Str(allow_none=True)
    priority_3 = fields.Str(allow_none=True)
    notes = fields.Str(allow_none=True)


@priorities_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_priorities():
    user_id = get_jwt_identity()
    today = date.today()
    priority = DailyPriority.query.filter_by(user_id=user_id, date=today).first()
    if not priority:
        return jsonify({'priority': None}), 200
    return jsonify({'priority': priority.to_dict()}), 200


@priorities_bp.route('/', methods=['POST'])
@jwt_required()
@require_json
def create_or_update_priorities():
    user_id = get_jwt_identity()
    schema = DailyPrioritySchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    target_date = data.get('date') or date.today()
    priority = DailyPriority.query.filter_by(user_id=user_id, date=target_date).first()

    if priority:
        for field in ('priority_1', 'priority_2', 'priority_3', 'notes'):
            if field in data:
                setattr(priority, field, data[field])
    else:
        priority = DailyPriority(
            user_id=user_id,
            date=target_date,
            priority_1=data.get('priority_1'),
            priority_2=data.get('priority_2'),
            priority_3=data.get('priority_3'),
            notes=data.get('notes'),
        )
        db.session.add(priority)

    db.session.commit()
    return jsonify({'priority': priority.to_dict()}), 200


@priorities_bp.route('/<date_str>', methods=['GET'])
@jwt_required()
def get_priorities_for_date(date_str: str):
    user_id = get_jwt_identity()
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    priority = DailyPriority.query.filter_by(user_id=user_id, date=target_date).first()
    if not priority:
        return jsonify({'priority': None}), 200
    return jsonify({'priority': priority.to_dict()}), 200
