from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.analytics_service import (
    get_weekly_summary, get_monthly_summary, get_patterns, get_streaks,
)
from app.utils.helpers import get_week_start

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/week', methods=['GET'])
@jwt_required()
def weekly_analytics():
    user_id = get_jwt_identity()
    week_start_str = request.args.get('week_start')

    if week_start_str:
        try:
            week_start = date.fromisoformat(week_start_str)
        except ValueError:
            return jsonify({'error': 'Invalid week_start format. Use YYYY-MM-DD'}), 400
    else:
        week_start = get_week_start(date.today())

    summary = get_weekly_summary(user_id, week_start)
    return jsonify(summary), 200


@analytics_bp.route('/month', methods=['GET'])
@jwt_required()
def monthly_analytics():
    user_id = get_jwt_identity()
    today = date.today()
    try:
        month = int(request.args.get('month', today.month))
        year = int(request.args.get('year', today.year))
    except ValueError:
        return jsonify({'error': 'Invalid month or year parameter'}), 400

    summary = get_monthly_summary(user_id, month, year)
    return jsonify(summary), 200


@analytics_bp.route('/patterns', methods=['GET'])
@jwt_required()
def time_patterns():
    user_id = get_jwt_identity()
    patterns = get_patterns(user_id)
    return jsonify(patterns), 200


@analytics_bp.route('/streaks', methods=['GET'])
@jwt_required()
def completion_streaks():
    user_id = get_jwt_identity()
    streaks = get_streaks(user_id)
    return jsonify(streaks), 200
