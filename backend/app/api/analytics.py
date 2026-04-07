from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app.services.analytics_service import AnalyticsService


@api_bp.route('/analytics/summary', methods=['GET'])
def analytics_summary():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    result, status = AnalyticsService.get_summary(user.id)
    return jsonify(result), status


@api_bp.route('/analytics/productivity', methods=['GET'])
def analytics_productivity():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    days = request.args.get('days', 30, type=int) or 30
    days = max(1, min(int(days), 365))
    result, status = AnalyticsService.get_productivity(user.id, days)
    return jsonify(result), status


@api_bp.route('/analytics/weekly', methods=['GET'])
def analytics_weekly():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    weeks = request.args.get('weeks', 8, type=int) or 8
    weeks = max(1, min(int(weeks), 52))
    result, status = AnalyticsService.get_weekly(user.id, weeks)
    return jsonify(result), status
