"""
Standalone hourly Hora push notification runner.
Railway cron start command: python cron_hora.py
Schedule: 0 * * * *  (every hour at :00)
"""
import sys
import os
from datetime import datetime

# Add backend root to path so `app` package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
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


def run():
    app = create_app()
    with app.app_context():
        now  = datetime.utcnow()
        hora = get_current_hora(now)
        chog = get_choghadiya(now)

        planet  = hora.get('planet', 'Unknown')
        meaning = hora.get('meaning', '')
        emoji   = HORA_PLANET_EMOJI.get(planet, '🪐')

        title = f'{emoji} {planet} Hora'
        body  = meaning if meaning else f'{planet} rules this hour'

        current = chog.get('current', {})
        cname   = current.get('name_en', '')
        cicon   = CHOGHADIYA_ICON.get(cname, '')
        cmean   = current.get('meaning', '')
        if cname:
            body += f'  ·  {cicon} {cname}: {cmean}' if cmean else f'  ·  {cicon} {cname}'

        sent, failed = send_push_to_all(title, body, url='/vedic-panchang')
        print(f'[hora-cron] {now.strftime("%Y-%m-%d %H:%M")} UTC | hora={planet} | sent={sent} failed={failed}', flush=True)
        return sent, failed


if __name__ == '__main__':
    try:
        sent, failed = run()
        sys.exit(0)
    except Exception as e:
        print(f'[hora-cron] FATAL: {type(e).__name__}: {e}', flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)
