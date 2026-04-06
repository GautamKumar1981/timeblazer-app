from datetime import date, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.review import WeeklyReview
from app.schemas import WeeklyReviewCreateSchema
from app.services import AnalyticsService
from app.utils.helpers import get_week_start

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly_review():
    """Get the latest weekly review.
    ---
    tags: [Reviews]
    security:
      - Bearer: []
    responses:
      200:
        description: Latest weekly review (empty object if none)
    """
    user_id = int(get_jwt_identity())
    review = (
        WeeklyReview.query.filter_by(user_id=user_id)
        .order_by(WeeklyReview.week_start_date.desc())
        .first()
    )
    if not review:
        return jsonify({}), 200
    return jsonify(review.to_dict()), 200


@reviews_bp.route("/weekly", methods=["POST"])
@jwt_required()
def generate_weekly_review():
    """Generate or update a weekly review.
    ---
    tags: [Reviews]
    security:
      - Bearer: []
    responses:
      200:
        description: Existing review updated
      201:
        description: New weekly review generated
      400:
        description: Validation error
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json(silent=True) or {}

    try:
        data = WeeklyReviewCreateSchema().load(json_data)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.messages}), 400

    week_start = data.get("week_start_date") or get_week_start(date.today() - timedelta(days=7))
    week_end = week_start + timedelta(days=6)

    stats = AnalyticsService.get_weekly_stats(user_id=user_id, week_start=week_start)
    completion_rate = stats.get("completion_rate", 0.0)

    # Build automatic insights
    key_insights = data.get("key_insights") or []
    if not key_insights:
        if completion_rate >= 80:
            key_insights.append(f"Excellent week! You completed {completion_rate:.1f}% of your timeboxes.")
        elif completion_rate >= 50:
            key_insights.append(f"Solid progress with {completion_rate:.1f}% completion rate.")
        else:
            key_insights.append(f"Challenging week with {completion_rate:.1f}% completion. Keep going!")

        streak = stats.get("streak_days", 0)
        if streak > 0:
            key_insights.append(f"You are on a {streak}-day productive streak!")

    wins = data.get("wins") or []
    if not wins and completion_rate >= 75:
        wins.append("Hit your weekly completion target")

    improvements = data.get("improvements") or []

    existing = WeeklyReview.query.filter_by(user_id=user_id, week_start_date=week_start).first()
    if existing:
        existing.completion_rate = completion_rate
        existing.key_insights = key_insights
        existing.wins = wins
        existing.improvements = improvements
        existing.next_week_focus = data.get("next_week_focus") or existing.next_week_focus
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    review = WeeklyReview(
        user_id=user_id,
        week_start_date=week_start,
        week_end_date=week_end,
        completion_rate=completion_rate,
        key_insights=key_insights,
        wins=wins,
        improvements=improvements,
        next_week_focus=data.get("next_week_focus"),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201
