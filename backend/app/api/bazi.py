from flask import request, jsonify
from datetime import date, datetime, timezone, timedelta

from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.bazi_profile import BaziProfile

RASHIS = [
    'Mesh', 'Brish', 'Mithun', 'Karkat', 'Simha', 'Kanya',
    'Tula', 'Brishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen',
]


def _compute_moon(birth_date, birth_hour, birth_minute, timezone_offset, birth_lat, birth_lon):
    try:
        from app.vedic.astronomy import sidereal_moon
        from app.vedic.panchang import NAKSHATRAS
        birth_dt_local = datetime(birth_date.year, birth_date.month, birth_date.day,
                                  birth_hour, birth_minute, 0)
        birth_dt_utc = (birth_dt_local - timedelta(hours=timezone_offset)).replace(tzinfo=timezone.utc)
        moon_lon = sidereal_moon(birth_dt_utc)
        moon_rashi = RASHIS[int(moon_lon / 30) % 12]
        moon_nakshatra = NAKSHATRAS[int(moon_lon / (360 / 27)) % 27]['en']
        return moon_rashi, moon_nakshatra, round(moon_lon, 4)
    except Exception:
        return '', '', None


from app.bazi.calculator import calculate_chart
from app.bazi.luck_pillars import calculate_luck_pillars
from app.bazi.forecast import (
    get_daily_forecast, get_calendar_month,
    get_business_timing, BUSINESS_ACTIVITIES,
)
from app.bazi.wisdom import get_wisdom_for_day
from app.bazi.remedies import get_daily_remedy
from app.bazi.stories import get_stem_story, get_branch_story


# ── Profile ───────────────────────────────────────────────────────────────────

@api_bp.route('/bazi/profile', methods=['GET'])
def bazi_get_profile():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    return jsonify({'profile': p.to_dict() if p else None}), 200


@api_bp.route('/bazi/profile', methods=['POST'])
def bazi_save_profile():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    data = request.get_json() or {}
    for field in ('birth_date', 'birth_hour', 'gender'):
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        birth_date = date.fromisoformat(data['birth_date'])
    except ValueError:
        return jsonify({'error': 'Invalid birth_date. Use YYYY-MM-DD'}), 400

    birth_hour = int(data['birth_hour'])
    if not 0 <= birth_hour <= 23:
        return jsonify({'error': 'birth_hour must be 0–23'}), 400

    gender = str(data['gender']).upper()
    if gender not in ('M', 'F'):
        return jsonify({'error': 'gender must be M or F'}), 400

    birth_minute     = int(data.get('birth_minute', 0))
    timezone_offset  = float(data.get('timezone_offset', 0.0))
    birth_country    = str(data.get('birth_country', ''))
    birth_city       = str(data.get('birth_city', ''))
    birth_lat        = float(data['birth_lat']) if data.get('birth_lat') is not None else None
    birth_lon        = float(data['birth_lon']) if data.get('birth_lon') is not None else None

    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if p:
        p.birth_date      = birth_date
        p.birth_hour      = birth_hour
        p.birth_minute    = birth_minute
        p.gender          = gender
        p.timezone_offset = timezone_offset
        p.birth_country   = birth_country
        p.birth_city      = birth_city
        p.birth_lat       = birth_lat
        p.birth_lon       = birth_lon
    else:
        p = BaziProfile(
            user_id=user.id,
            birth_date=birth_date,
            birth_hour=birth_hour,
            birth_minute=birth_minute,
            gender=gender,
            timezone_offset=timezone_offset,
            birth_country=birth_country,
            birth_city=birth_city,
            birth_lat=birth_lat,
            birth_lon=birth_lon,
        )
        db.session.add(p)

    if birth_lat is not None and birth_lon is not None:
        moon_rashi, moon_nakshatra, moon_longitude = _compute_moon(
            birth_date, birth_hour, birth_minute, timezone_offset, birth_lat, birth_lon)
        p.moon_rashi = moon_rashi
        p.moon_nakshatra = moon_nakshatra
        p.moon_longitude = moon_longitude

    db.session.commit()
    return jsonify({'profile': p.to_dict()}), 200


# ── Chart ─────────────────────────────────────────────────────────────────────

@api_bp.route('/bazi/chart', methods=['GET'])
def bazi_chart():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'error': 'profile_required'}), 404
    chart = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    return jsonify({'chart': chart}), 200


# ── Luck Pillars ──────────────────────────────────────────────────────────────

@api_bp.route('/bazi/luck-pillars', methods=['GET'])
def bazi_luck_pillars():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'error': 'profile_required'}), 404

    chart = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    ms = chart['month']['stem_index']
    mb = chart['month']['branch_index']
    result = calculate_luck_pillars(p.birth_date, p.gender, ms, mb)
    return jsonify({'luck_pillars': result}), 200


# ── Daily forecast ────────────────────────────────────────────────────────────

@api_bp.route('/bazi/daily', methods=['GET'])
def bazi_daily():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'error': 'profile_required'}), 404

    date_str = request.args.get('date', date.today().isoformat())
    try:
        target = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    chart    = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    forecast = get_daily_forecast(target, chart['favorable_elements'], chart['unfavorable_elements'])

    day_elem = forecast['pillar']['stem']['element']
    forecast['wisdom']  = get_wisdom_for_day(day_elem, forecast['score'])
    forecast['remedy']  = get_daily_remedy(day_elem, chart['favorable_elements'], chart['unfavorable_elements'])
    forecast['pillar_story'] = {
        'stem':   get_stem_story(forecast['pillar']['stem_index']),
        'branch': get_branch_story(forecast['pillar']['branch_index']),
    }
    return jsonify({'forecast': forecast}), 200


# ── Calendar ──────────────────────────────────────────────────────────────────

@api_bp.route('/bazi/calendar', methods=['GET'])
def bazi_calendar():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'error': 'profile_required'}), 404

    today = date.today()
    year  = int(request.args.get('year',  today.year))
    month = int(request.args.get('month', today.month))

    chart = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    days  = get_calendar_month(year, month, chart['favorable_elements'], chart['unfavorable_elements'])
    return jsonify({'calendar': days, 'year': year, 'month': month}), 200


# ── Business timing ───────────────────────────────────────────────────────────

@api_bp.route('/bazi/business-timing', methods=['POST'])
def bazi_business_timing():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'error': 'profile_required'}), 404

    data       = request.get_json() or {}
    activity   = data.get('activity', 'meeting')
    days_ahead = min(int(data.get('days_ahead', 30)), 90)

    chart  = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    result = get_business_timing(activity, date.today(), days_ahead,
                                 chart['favorable_elements'], chart['unfavorable_elements'])
    return jsonify(result), 200


@api_bp.route('/bazi/activities', methods=['GET'])
def bazi_activities():
    return jsonify({'activities': [
        {'key': k, 'name': v['name'], 'icon': v['icon'], 'description': v['description']}
        for k, v in BUSINESS_ACTIVITIES.items()
    ]}), 200


# ── Today dashboard summary ───────────────────────────────────────────────────

@api_bp.route('/bazi/today', methods=['GET'])
def bazi_today():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401
    p = BaziProfile.query.filter_by(user_id=user.id).first()
    if not p:
        return jsonify({'profile_required': True}), 200

    today    = date.today()
    chart    = calculate_chart(p.birth_date, p.birth_hour, p.gender)
    forecast = get_daily_forecast(today, chart['favorable_elements'], chart['unfavorable_elements'])

    day_elem = forecast['pillar']['stem']['element']
    forecast['wisdom'] = get_wisdom_for_day(day_elem, forecast['score'])
    forecast['remedy'] = get_daily_remedy(day_elem, chart['favorable_elements'], chart['unfavorable_elements'])
    forecast['pillar_story'] = {
        'stem':   get_stem_story(forecast['pillar']['stem_index']),
        'branch': get_branch_story(forecast['pillar']['branch_index']),
    }

    return jsonify({
        'date':                 today.isoformat(),
        'day_master':           chart['day_master'],
        'day_master_strength':  chart['day_master_strength'],
        'favorable_elements':   chart['favorable_elements'],
        'unfavorable_elements': chart['unfavorable_elements'],
        'forecast':             forecast,
    }), 200
