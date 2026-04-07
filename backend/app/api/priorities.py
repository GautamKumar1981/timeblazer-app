from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.daily_priority import DailyPriority
from datetime import date


@api_bp.route('/priorities', methods=['GET'])
def list_priorities():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    date_str = request.args.get('date')
    query = DailyPriority.query.filter_by(user_id=user.id)

    if date_str:
        try:
            filter_date = date.fromisoformat(date_str)
            query = query.filter_by(date=filter_date)
        except ValueError:
            return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    priorities = query.order_by(DailyPriority.priority_order).all()
    return jsonify({'priorities': [p.to_dict() for p in priorities]}), 200


@api_bp.route('/priorities', methods=['POST'])
def create_priority():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400

    priority_date = date.today()
    if data.get('date'):
        try:
            priority_date = date.fromisoformat(data['date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    max_order = db.session.query(db.func.max(DailyPriority.priority_order)).filter_by(
        user_id=user.id, date=priority_date
    ).scalar() or 0

    priority = DailyPriority(
        user_id=user.id,
        title=title,
        description=data.get('description', ''),
        date=priority_date,
        priority_order=data.get('priority_order', max_order + 1),
        completed=False,
    )
    db.session.add(priority)
    db.session.commit()
    return jsonify({'priority': priority.to_dict()}), 201


@api_bp.route('/priorities/<int:priority_id>', methods=['PUT'])
def update_priority(priority_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    priority = DailyPriority.query.filter_by(id=priority_id, user_id=user.id).first()
    if not priority:
        return jsonify({'error': 'Priority not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    for field in ('title', 'description', 'priority_order', 'completed'):
        if field in data:
            setattr(priority, field, data[field])

    db.session.commit()
    return jsonify({'priority': priority.to_dict()}), 200


@api_bp.route('/priorities/<int:priority_id>', methods=['DELETE'])
def delete_priority(priority_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    priority = DailyPriority.query.filter_by(id=priority_id, user_id=user.id).first()
    if not priority:
        return jsonify({'error': 'Priority not found'}), 404

    db.session.delete(priority)
    db.session.commit()
    return jsonify({'message': 'Priority deleted'}), 200
