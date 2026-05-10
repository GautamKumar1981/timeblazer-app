from datetime import datetime, timezone, date as date_type
from flask import request, jsonify
from app.api import api_bp
from app.api.utils import get_current_user
from app import db
from app.models.bazi_profile import BaziProfile
from app.vedic.panchang import get_panchang
from app.vedic.choghadiya import get_choghadiya, get_current_hora, get_hora_schedule
from app.vedic.dasha import calculate_dasha
from app.vedic.astronomy import sidereal_moon
from app.vedic.bikram_sambat import ad_to_bs, BS_MONTH_NAMES_EN, BS_MONTH_NAMES_NP

RASHIS = [
    'Mesh', 'Brish', 'Mithun', 'Karkat', 'Simha', 'Kanya',
    'Tula', 'Brishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen',
]
RASHIS_NP = [
    'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या',
    'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन',
]
RASHIFAL = {
    'Mesh':     'Energy is high. Push forward on key projects. Avoid impulsive decisions after 3pm.',
    'Brish':    'Financial opportunities arise. Focus on long-term stability over quick gains.',
    'Mithun':   'Communication is your strength today. Ideal for meetings, writing, and networking.',
    'Karkat':   'Emotional sensitivity heightened. Nurture relationships and avoid confrontations.',
    'Simha':    'Your confidence shines. Lead boldly — presentations and public events go well.',
    'Kanya':    'Detail-oriented tasks flow smoothly. Excellent day for analysis and planning.',
    'Tula':     'Partnerships and balance are favored. Negotiations and agreements are favorable.',
    'Brishchik':'Depth and intensity fuel your work. Research, investigation, and strategy excel.',
    'Dhanu':    'Optimism and learning mark the day. Travel, teaching, and philosophy are favored.',
    'Makar':    'Hard work yields results. Discipline and structure lead to tangible progress.',
    'Kumbha':   'Innovation and community focus. Technology, humanitarian work, and networking shine.',
    'Meen':     'Intuition and creativity peak. Artistic, spiritual, and healing activities thrive.',
}


@api_bp.route('/vedic/today', methods=['GET'])
def vedic_today():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    now = datetime.now(timezone.utc)
    panchang = get_panchang(now)
    choghadiya = get_choghadiya(now)
    hora = get_current_hora(now)
    hora_schedule = get_hora_schedule(now)

    profile = None
    rashifal = None
    profile_required = True
    try:
        profile = BaziProfile.query.filter_by(user_id=user.id).first()
        if profile and profile.moon_rashi:
            rashifal = {
                'rashi': profile.moon_rashi,
                'rashi_np': RASHIS_NP[RASHIS.index(profile.moon_rashi)] if profile.moon_rashi in RASHIS else '',
                'reading': RASHIFAL.get(profile.moon_rashi, 'A balanced day ahead. Focus on your priorities.'),
                'nakshatra': profile.moon_nakshatra,
            }
        profile_required = profile is None or not profile.moon_rashi
    except Exception as e:
        print(f"vedic_today profile lookup error: {e}")

    best_windows = [s for s in choghadiya['day_slots'] if s['quality'] in ('excellent', 'auspicious')]

    return jsonify({
        'panchang': panchang,
        'choghadiya': choghadiya,
        'current_hora': hora,
        'hora_schedule': hora_schedule,
        'rashifal': rashifal,
        'best_windows': best_windows,
        'profile_required': profile_required,
    }), 200


@api_bp.route('/vedic/panchang', methods=['GET'])
def vedic_panchang():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    date_str = request.args.get('date')
    if date_str:
        try:
            d = date_type.fromisoformat(date_str)
            dt = datetime(d.year, d.month, d.day, 6, 0, 0, tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        dt = datetime.now(timezone.utc)

    panchang = get_panchang(dt)
    choghadiya = get_choghadiya(dt)
    hora = get_current_hora(dt)

    return jsonify({'panchang': panchang, 'choghadiya': choghadiya, 'hora': hora}), 200


@api_bp.route('/vedic/dasha', methods=['GET'])
def vedic_dasha():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    try:
        profile = BaziProfile.query.filter_by(user_id=user.id).first()
    except Exception as e:
        print(f"vedic_dasha profile lookup error: {e}")
        return jsonify({'error': 'Birth profile with location not set up', 'profile_required': True}), 400

    if not profile or not profile.moon_longitude:
        return jsonify({'error': 'Birth profile with location not set up', 'profile_required': True}), 400

    dasha = calculate_dasha(profile.birth_date, profile.moon_longitude)
    return jsonify({'dasha': dasha, 'profile': profile.to_dict()}), 200


@api_bp.route('/vedic/calendar', methods=['GET'])
def vedic_calendar():
    user, err = get_current_user()
    if err:
        return jsonify({'error': err}), 401

    from datetime import timedelta
    import calendar as cal_mod

    year = int(request.args.get('year', datetime.now().year))
    month = int(request.args.get('month', datetime.now().month))

    first_day = date_type(year, month, 1)
    last_day = date_type(year, month, cal_mod.monthrange(year, month)[1])

    days = []
    current = first_day
    while current <= last_day:
        dt = datetime(current.year, current.month, current.day, 6, 0, 0, tzinfo=timezone.utc)
        pan = get_panchang(dt)
        try:
            bs_y, bs_m, bs_d = ad_to_bs(current)
            bs_str = f"{bs_d} {BS_MONTH_NAMES_EN[bs_m-1]}"
        except Exception:
            bs_str = ''

        days.append({
            'date': current.isoformat(),
            'bs_date': bs_str,
            'tithi': pan['tithi']['name_en'],
            'tithi_np': pan['tithi']['name_np'],
            'paksha': pan['tithi']['paksha'],
            'nakshatra': pan['nakshatra']['en'],
            'nakshatra_np': pan['nakshatra']['np'],
            'yoga': pan['yoga']['en'],
            'overall': pan['overall'],
            'overall_color': pan['overall_color'],
            'vara': pan['vara']['en'],
            'is_auspicious': pan['tithi']['auspicious'] and pan['nakshatra']['quality'] == 'auspicious',
        })
        current += timedelta(days=1)

    return jsonify({'calendar': days, 'year': year, 'month': month}), 200
