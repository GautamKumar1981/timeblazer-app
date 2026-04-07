from flask import request, jsonify
from app.api import api_bp
from app.services.auth_service import AuthService
from app.services.analytics_service import AnalyticsService


def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, 'Token is missing'
    token = auth_header.split(' ')[1]
    return AuthService.get_current_user(token)


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

    days = request.args.get('days', 30, type=int)
    result, status = AnalyticsService.get_productivity(user.id, days)
    return jsonify(result), status


@api_bp.route('/analytics/weekly', methods=['GET'])
def analytics_weekly():
    user, error = get_current_user()
    if error:
        return jsonify({'error': error}), 401

    weeks = request.args.get('weeks', 8, type=int)
    result, status = AnalyticsService.get_weekly(user.id, weeks)
    return jsonify(result), status
