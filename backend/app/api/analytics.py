from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import AnalyticsService
from app.utils.helpers import get_week_start

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/week", methods=["GET"])
@jwt_required()
def weekly_stats():
    """Get weekly analytics stats.
    ---
    tags: [Analytics]
    security:
      - Bearer: []
    parameters:
      - in: query
        name: week_start
        type: string
        description: ISO date of week start (YYYY-MM-DD). Defaults to current week.
    responses:
      200:
        description: Weekly stats
      400:
        description: Invalid date format
    """
    user_id = int(get_jwt_identity())
    week_start_param = request.args.get("week_start")

    week_start = None
    if week_start_param:
        try:
            week_start = date.fromisoformat(week_start_param)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    else:
        week_start = get_week_start(date.today())

    stats = AnalyticsService.get_weekly_stats(user_id=user_id, week_start=week_start)

    # Serialize dates to strings
    stats["week_start"] = stats["week_start"].isoformat()
    stats["week_end"] = stats["week_end"].isoformat()

    return jsonify(stats), 200


@analytics_bp.route("/month", methods=["GET"])
@jwt_required()
def monthly_stats():
    """Get monthly analytics stats.
    ---
    tags: [Analytics]
    security:
      - Bearer: []
    parameters:
      - in: query
        name: month
        type: integer
        description: Month number (1-12). Defaults to current month.
      - in: query
        name: year
        type: integer
        description: Year. Defaults to current year.
    responses:
      200:
        description: Monthly stats
      400:
        description: Invalid parameters
    """
    user_id = int(get_jwt_identity())
    today = date.today()

    try:
        month = int(request.args.get("month", today.month))
        year = int(request.args.get("year", today.year))
    except (ValueError, TypeError):
        return jsonify({"error": "month and year must be integers"}), 400

    if not (1 <= month <= 12):
        return jsonify({"error": "month must be between 1 and 12"}), 400

    stats = AnalyticsService.get_monthly_stats(user_id=user_id, month=month, year=year)
    return jsonify(stats), 200


@analytics_bp.route("/patterns", methods=["GET"])
@jwt_required()
def patterns():
    """Get pattern analysis (busiest days/hours, categories).
    ---
    tags: [Analytics]
    security:
      - Bearer: []
    responses:
      200:
        description: Pattern data
    """
    user_id = int(get_jwt_identity())
    data = AnalyticsService.get_patterns(user_id=user_id)
    return jsonify(data), 200


@analytics_bp.route("/streaks", methods=["GET"])
@jwt_required()
def streaks():
    """Get streak information.
    ---
    tags: [Analytics]
    security:
      - Bearer: []
    responses:
      200:
        description: Streak data
    """
    user_id = int(get_jwt_identity())
    data = AnalyticsService.get_streaks(user_id=user_id)
    if data.get("last_active_date"):
        data["last_active_date"] = data["last_active_date"].isoformat()
    return jsonify(data), 200
