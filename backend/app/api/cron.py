import os
from datetime import datetime
from flask import request, jsonify
from app.api import api_bp
from app.vedic.choghadiya import get_current_hora, get_choghadiya
from app.services.push_service import send_push_to_all


HORA_PLANET_EMOJI = {
    'Sun':     '☀️',
    'Moon':    '🌙',
    'Mars':    '🔴',
    'Mercury': '🟢',
    'Jupiter': '🟡',
    'Venus':   '💜',
    'Saturn':  '🪐',
}

CHOGHADIYA_ICON = {
    'Amrit': '✨',
    'Shubh': '🌟',
    'Labh':  '💰',
    'Char':  '🚀',
    'Kaal':  '⚠️',
    'Rog':   '🚫',
    'Udveg': '😰',
}


@api_bp.route('/cron/hora-notification', methods=['POST'])
def hora_notification():
    secret = os.environ.get('CRON_SECRET', '')
    if secret and request.headers.get('X-Cron-Secret') != secret:
        return jsonify({'error': 'Unauthorized'}), 401

    now = datetime.utcnow()
    hora = get_current_hora(now)
    chog = get_choghadiya(now)

    planet  = hora.get('planet', 'Unknown')
    meaning = hora.get('meaning', '')
    emoji   = HORA_PLANET_EMOJI.get(planet, '🪐')

    title = f'{emoji} {planet} Hora'
    body  = meaning if meaning else f'{planet} rules this hour'

    # Append Choghadiya if available
    current = chog.get('current', {}) if chog else {}
    cname   = current.get('name_en', '')
    cicon   = CHOGHADIYA_ICON.get(cname, '')
    cmean   = current.get('meaning', '')
    if cname:
        body += f'  ·  {cicon} {cname}: {cmean}' if cmean else f'  ·  {cicon} {cname}'

    sent, failed = send_push_to_all(title, body, url='/vedic-panchang')
    return jsonify({'sent': sent, 'failed': failed, 'hora': planet, 'choghadiya': cname or None})
