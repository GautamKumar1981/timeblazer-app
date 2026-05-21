import os
import threading
import time
from datetime import datetime, timedelta

bind = f"0.0.0.0:{os.environ.get('PORT', '8080')}"
workers = 2
threads = 2
timeout = 120

HORA_EMOJI = {
    'Sun': '☀️', 'Moon': '🌙', 'Mars': '🔴',
    'Mercury': '🟢', 'Jupiter': '🟡', 'Venus': '💜', 'Saturn': '🪐',
}
CHOG_ICON = {
    'Amrit': '✨', 'Shubh': '🌟', 'Labh': '💰',
    'Char': '🚀', 'Kaal': '⚠️', 'Rog': '🚫', 'Udveg': '😰',
}


def _send_hora_notification():
    from app import create_app
    from app.vedic.choghadiya import get_current_hora, get_choghadiya
    from app.services.push_service import send_push_to_all

    app = create_app()
    with app.app_context():
        now    = datetime.utcnow()
        hora   = get_current_hora(now)
        chog   = get_choghadiya(now)
        planet = hora.get('planet', 'Unknown')
        body   = hora.get('meaning', f'{planet} rules this hour')

        cur   = (chog or {}).get('current', {})
        cname = cur.get('name_en', '')
        if cname:
            body += f"  ·  {CHOG_ICON.get(cname, '')} {cname}: {cur.get('meaning', '')}"

        sent, failed = send_push_to_all(
            f"{HORA_EMOJI.get(planet, '🪐')} {planet} Hora",
            body,
            '/vedic-panchang',
        )
        print(f'[hora] {now:%Y-%m-%d %H:%M} UTC | planet={planet} sent={sent} failed={failed}', flush=True)


def _scheduler_loop():
    time.sleep(10)  # let workers boot first
    while True:
        try:
            now       = datetime.utcnow()
            next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            wait_secs = (next_hour - datetime.utcnow()).total_seconds()
            time.sleep(max(wait_secs, 1))
            _send_hora_notification()
        except Exception as exc:
            print(f'[hora] scheduler error: {exc}', flush=True)
            time.sleep(60)


def on_starting(server):
    """Runs in gunicorn master process — not forked into workers, so fires exactly once per hour."""
    t = threading.Thread(target=_scheduler_loop, daemon=True)
    t.start()
    print('[hora] scheduler started', flush=True)
