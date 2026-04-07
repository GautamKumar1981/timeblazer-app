from flask import request, jsonify
from app.api import api_bp
from app.services.auth_service import AuthService
from app import db
from app.models.review import Review
from datetime import date


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Token is missing'
    token = auth_header.split(' ')[1]
    return AuthService.get_current_user(token)


@api_bp.route('/reviews', methods=['GET'])
def list_reviews():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    reviews = Review.query.filter_by(user_id=user.id).order_by(Review.week_start.desc()).all()
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


@api_bp.route('/reviews', methods=['POST'])
def create_review():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    week_start_str = data.get('week_start')
    week_end_str = data.get('week_end')
    if not week_start_str or not week_end_str:
        return jsonify({'error': 'week_start and week_end are required'}), 400

    try:
        week_start = date.fromisoformat(week_start_str)
        week_end = date.fromisoformat(week_end_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

    overall_rating = data.get('overall_rating')
    if overall_rating is not None and not (1 <= int(overall_rating) <= 5):
        return jsonify({'error': 'overall_rating must be between 1 and 5'}), 400

    review = Review(
        user_id=user.id,
        week_start=week_start,
        week_end=week_end,
        accomplishments=data.get('accomplishments', ''),
        challenges=data.get('challenges', ''),
        goals_next_week=data.get('goals_next_week', ''),
        overall_rating=overall_rating,
        auto_generated=data.get('auto_generated', False),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({'review': review.to_dict()}), 201


@api_bp.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    review = Review.query.filter_by(id=review_id, user_id=user.id).first()
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    return jsonify({'review': review.to_dict()}), 200


@api_bp.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    review = Review.query.filter_by(id=review_id, user_id=user.id).first()
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    for field in ('accomplishments', 'challenges', 'goals_next_week', 'overall_rating'):
        if field in data:
            setattr(review, field, data[field])

    db.session.commit()
    return jsonify({'review': review.to_dict()}), 200
