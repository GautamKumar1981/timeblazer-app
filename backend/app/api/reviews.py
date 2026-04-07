from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from app import db
from app.models.review import WeeklyReview
from app.services.analytics_service import get_weekly_summary
from app.utils.decorators import require_json
from app.utils.helpers import get_week_start

reviews_bp = Blueprint('reviews', __name__)


class WeeklyReviewUpdateSchema(Schema):
    wins = fields.List(fields.Str())
    improvements = fields.List(fields.Str())
    insights = fields.Str(allow_none=True)
    mood = fields.Int(allow_none=True)


@reviews_bp.route('/weekly', methods=['GET'])
@jwt_required()
def list_weekly_reviews():
    user_id = get_jwt_identity()
    reviews = (
        WeeklyReview.query.filter_by(user_id=user_id)
        .order_by(WeeklyReview.week_start_date.desc())
        .all()
    )
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


@reviews_bp.route('/weekly/<week_start_str>', methods=['GET'])
@jwt_required()
def get_weekly_review(week_start_str: str):
    user_id = get_jwt_identity()
    try:
        week_start = date.fromisoformat(week_start_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    review = WeeklyReview.query.filter_by(user_id=user_id, week_start_date=week_start).first()
    if not review:
        return jsonify({'review': None}), 200
    return jsonify({'review': review.to_dict()}), 200


@reviews_bp.route('/weekly/generate', methods=['POST'])
@jwt_required()
def generate_weekly_review():
    user_id = get_jwt_identity()
    week_start_str = request.args.get('week_start')

    if week_start_str:
        try:
            week_start = date.fromisoformat(week_start_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    else:
        week_start = get_week_start(date.today())

    summary = get_weekly_summary(user_id, week_start)
    completion_rate = (
        summary['completed_count'] / summary['total_timeboxes'] * 100
        if summary['total_timeboxes'] > 0 else 0.0
    )

    review = WeeklyReview.query.filter_by(user_id=user_id, week_start_date=week_start).first()
    if not review:
        review = WeeklyReview(
            user_id=user_id,
            week_start_date=week_start,
            completion_rate=completion_rate,
            wins=[],
            improvements=[],
            insights=f"Week of {week_start.isoformat()}: {summary['completed_count']} timeboxes completed out of {summary['total_timeboxes']}.",
        )
        db.session.add(review)
    else:
        review.completion_rate = completion_rate

    db.session.commit()
    return jsonify({'review': review.to_dict()}), 200


@reviews_bp.route('/weekly/<review_id>', methods=['PUT'])
@jwt_required()
@require_json
def update_weekly_review(review_id: str):
    user_id = get_jwt_identity()
    review = WeeklyReview.query.filter_by(id=review_id, user_id=user_id).first()
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    schema = WeeklyReviewUpdateSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422

    for field in ('wins', 'improvements', 'insights', 'mood'):
        if field in data:
            setattr(review, field, data[field])
    db.session.commit()
    return jsonify({'review': review.to_dict()}), 200
