"""
Choghadiya and Hora calculator for Nepali Jyotish.
Choghadiya: 8 auspicious/inauspicious segments per day and night.
Hora: Planetary hour ruler for each clock hour.
"""

from datetime import datetime, timedelta
import math

# ── Choghadiya ────────────────────────────────────────────────────────────────

# Choghadiya order starting from Sunday for day, and for night
# Format: (name, quality, meaning)
CHOGHADIYA_TYPES = {
    'Amrit':  {'en': 'Amrit',  'np': 'अमृत',  'quality': 'excellent',      'color': '#065f46', 'icon': '✨', 'meaning': 'Nectar — best for all auspicious activities'},
    'Kaal':   {'en': 'Kaal',   'np': 'काल',   'quality': 'inauspicious',   'color': '#dc2626', 'icon': '⚠️', 'meaning': 'Death — avoid starting new work'},
    'Shubh':  {'en': 'Shubh',  'np': 'शुभ',   'quality': 'auspicious',     'color': '#16a34a', 'icon': '🌟', 'meaning': 'Auspicious — good for all positive activities'},
    'Rog':    {'en': 'Rog',    'np': 'रोग',   'quality': 'inauspicious',   'color': '#ef4444', 'icon': '🚫', 'meaning': 'Disease — avoid important activities'},
    'Udveg':  {'en': 'Udveg',  'np': 'उद्वेग', 'quality': 'inauspicious',  'color': '#f97316', 'icon': '😰', 'meaning': 'Anxiety — government work only'},
    'Char':   {'en': 'Char',   'np': 'चर',    'quality': 'auspicious',     'color': '#2563eb', 'icon': '🚀', 'meaning': 'Movement — good for travel and change'},
    'Labh':   {'en': 'Labh',   'np': 'लाभ',   'quality': 'auspicious',     'color': '#7c3aed', 'icon': '💰', 'meaning': 'Profit — excellent for business and finance'},
}

# Choghadiya sequence for each weekday (0=Sun ... 6=Sat)
# Day choghadiya (8 segments from sunrise to sunset)
DAY_CHOGHADIYA = [
    ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],   # Sunday
    ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],   # Monday
    ['Rog',   'Udveg','Char',  'Labh','Amrit', 'Kaal', 'Shubh','Rog'],      # Tuesday
    ['Labh',  'Amrit','Kaal',  'Shubh','Rog',  'Udveg','Char', 'Labh'],     # Wednesday
    ['Shubh', 'Rog',  'Udveg', 'Char', 'Labh', 'Amrit','Kaal', 'Shubh'],   # Thursday
    ['Char',  'Labh', 'Amrit', 'Kaal', 'Shubh','Rog',  'Udveg','Char'],    # Friday
    ['Kaal',  'Shubh','Rog',   'Udveg','Char', 'Labh', 'Amrit','Kaal'],    # Saturday
]

# Night choghadiya (8 segments from sunset to next sunrise)
NIGHT_CHOGHADIYA = [
    ['Shubh', 'Amrit','Char',  'Rog',  'Kaal', 'Labh', 'Udveg','Shubh'],   # Sunday
    ['Labh',  'Udveg','Char',  'Amrit','Rog',  'Kaal', 'Shubh','Labh'],    # Monday -> actually Sun Mon mapping
    ['Kaal',  'Labh', 'Udveg', 'Shubh','Amrit','Rog',  'Char', 'Kaal'],    # Tuesday
    ['Amrit', 'Char', 'Rog',   'Kaal', 'Labh', 'Udveg','Shubh','Amrit'],   # Wednesday
    ['Rog',   'Kaal', 'Labh',  'Udveg','Shubh','Amrit','Char', 'Rog'],     # Thursday
    ['Udveg', 'Shubh','Amrit', 'Char', 'Rog',  'Kaal', 'Labh', 'Udveg'],   # Friday
    ['Char',  'Rog',  'Kaal',  'Labh', 'Udveg','Shubh','Amrit','Char'],    # Saturday
]

# Approximate sunrise/sunset for Kathmandu (lat 27.7°N)
# Sunrise ~6:15am, Sunset ~6:15pm (roughly 12 hour day/night year-round, adjusted ±1hr)
def _approximate_sunrise_sunset(dt: datetime) -> tuple[datetime, datetime]:
    """Very rough sunrise/sunset for Kathmandu (NPT = UTC+5:45)."""
    base_date = dt.date()
    # Kathmandu NPT offset = 5h 45m = 345 minutes
    # Sunrise ≈ 6:15 NPT = 00:30 UTC, Sunset ≈ 18:15 NPT = 12:30 UTC
    # Vary by ±1 hour based on season (month)
    month = dt.month
    # Simple seasonal adjustment
    if month in (11, 12, 1, 2):  # Winter
        sunrise_utc_h, sunrise_utc_m = 1, 0   # 6:45am NPT
        sunset_utc_h, sunset_utc_m = 12, 0    # 5:45pm NPT
    elif month in (5, 6, 7, 8):  # Summer/Monsoon
        sunrise_utc_h, sunrise_utc_m = 0, 0   # 5:45am NPT
        sunset_utc_h, sunset_utc_m = 13, 0    # 6:45pm NPT
    else:
        sunrise_utc_h, sunrise_utc_m = 0, 30  # ~6:15am NPT
        sunset_utc_h, sunset_utc_m = 12, 30   # ~6:15pm NPT

    sunrise = datetime(base_date.year, base_date.month, base_date.day,
                       sunrise_utc_h, sunrise_utc_m, tzinfo=dt.tzinfo)
    sunset = datetime(base_date.year, base_date.month, base_date.day,
                      sunset_utc_h, sunset_utc_m, tzinfo=dt.tzinfo)
    return sunrise, sunset


def get_choghadiya(dt: datetime) -> dict:
    """
    Return current Choghadiya and full day schedule for the given UTC datetime.
    Weekday uses Kathmandu local day (UTC+5:45 offset).
    """
    # Convert to NPT for weekday determination
    npt_offset = timedelta(hours=5, minutes=45)
    npt_dt = dt + npt_offset
    weekday_sun_based = npt_dt.weekday()  # Python: 0=Mon, convert to 0=Sun
    vara_idx = (weekday_sun_based + 1) % 7  # 0=Sun, 1=Mon, ..., 6=Sat

    sunrise, sunset = _approximate_sunrise_sunset(dt)
    day_duration = (sunset - sunrise).total_seconds()
    night_duration = 86400 - day_duration

    day_segment = day_duration / 8
    night_segment = night_duration / 8

    day_schedule = DAY_CHOGHADIYA[vara_idx]
    night_schedule = NIGHT_CHOGHADIYA[vara_idx]

    def build_slots(start: datetime, segment_secs: float, names: list) -> list:
        slots = []
        for i, name in enumerate(names):
            slot_start = start + timedelta(seconds=i * segment_secs)
            slot_end = start + timedelta(seconds=(i + 1) * segment_secs)
            ctype = CHOGHADIYA_TYPES[name]
            slots.append({
                'name_en': ctype['en'],
                'name_np': ctype['np'],
                'quality': ctype['quality'],
                'color': ctype['color'],
                'icon': ctype['icon'],
                'meaning': ctype['meaning'],
                'start': slot_start.strftime('%H:%M'),
                'end': slot_end.strftime('%H:%M'),
                'start_ts': slot_start.isoformat(),
                'end_ts': slot_end.isoformat(),
                'is_current': slot_start <= dt < slot_end,
                'is_day': True,
            })
        return slots

    day_slots = build_slots(sunrise, day_segment, day_schedule)

    # Night starts at sunset, may wrap into next day
    next_sunrise = sunrise + timedelta(days=1)
    night_slots_raw = build_slots(sunset, night_segment, night_schedule)
    for s in night_slots_raw:
        s['is_day'] = False

    all_slots = day_slots + night_slots_raw

    # Find current slot
    current = next((s for s in all_slots if s['is_current']), all_slots[0])

    # Rahu Kaal (approx, for Kathmandu)
    rahu_kaal_map = {
        0: (16, 30, 18, 0),   # Sunday: 4:30-6pm NPT
        1: (7,  30, 9,  0),   # Monday: 7:30-9am NPT
        2: (15,  0, 16, 30),  # Tuesday: 3-4:30pm NPT
        3: (12,  0, 13, 30),  # Wednesday: 12-1:30pm NPT
        4: (13, 30, 15,  0),  # Thursday: 1:30-3pm NPT
        5: (10, 30, 12,  0),  # Friday: 10:30am-12pm NPT
        6: (9,   0, 10, 30),  # Saturday: 9-10:30am NPT
    }
    rk = rahu_kaal_map.get(vara_idx, (0, 0, 0, 0))
    rahu_kaal = {'start': f"{rk[0]:02d}:{rk[1]:02d}", 'end': f"{rk[2]:02d}:{rk[3]:02d}", 'note': 'Avoid starting new work (Kathmandu NPT)'}

    return {
        'current': current,
        'day_slots': day_slots,
        'night_slots': night_slots_raw,
        'all_slots': all_slots,
        'rahu_kaal': rahu_kaal,
        'auspicious_today': [s for s in all_slots if s['quality'] in ('excellent', 'auspicious')],
    }


# ── Hora (Planetary Hours) ────────────────────────────────────────────────────

# Hora sequence starting from Sun for each day
# Planet rulers: Sun=0, Moon=1, Mars=2, Mercury=3, Jupiter=4, Venus=5, Saturn=6
HORA_PLANETS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
HORA_PLANET_NP = ['सूर्य', 'शुक्र', 'बुध', 'चन्द्र', 'शनि', 'बृहस्पति', 'मंगल']
HORA_COLORS = {
    'Sun': '#f59e0b', 'Moon': '#818cf8', 'Mars': '#ef4444',
    'Mercury': '#10b981', 'Jupiter': '#f97316', 'Venus': '#ec4899', 'Saturn': '#6b7280',
}
HORA_MEANINGS = {
    'Sun': 'Authority, health, government. Good for leadership decisions.',
    'Moon': 'Emotions, public relations, travel. Good for nurturing activities.',
    'Mars': 'Courage, energy, property. Good for action and initiative.',
    'Mercury': 'Communication, business, writing. Best for negotiations and learning.',
    'Jupiter': 'Wisdom, expansion, finance. Excellent for all auspicious activities.',
    'Venus': 'Relationships, arts, beauty. Good for creative and social activities.',
    'Saturn': 'Discipline, hard work, karma. Good for long-term planning.',
}

# Day of week to starting Hora planet (0=Sun, 1=Mon, ..., 6=Sat)
HORA_START_IDX = [0, 1, 2, 3, 4, 5, 6]  # Sun->Sun, Mon->Moon, Tue->Mars, Wed->Merc, Thu->Jup, Fri->Ven, Sat->Sat


def get_current_hora(dt: datetime) -> dict:
    """Return the current Hora (planetary hour) for the given UTC datetime."""
    npt_dt = dt + timedelta(hours=5, minutes=45)
    vara_idx = (npt_dt.weekday() + 1) % 7  # 0=Sun

    # Hora changes every 60 minutes from midnight, cycling through planets
    hour_of_day = npt_dt.hour  # 0-23
    start_planet_idx = HORA_START_IDX[vara_idx]
    current_planet_idx = (start_planet_idx + hour_of_day) % 7

    planet = HORA_PLANETS[current_planet_idx]
    return {
        'planet': planet,
        'planet_np': HORA_PLANET_NP[current_planet_idx],
        'color': HORA_COLORS[planet],
        'meaning': HORA_MEANINGS[planet],
        'hour': hour_of_day,
        'next_hora_in_minutes': 60 - npt_dt.minute,
    }


def get_hora_schedule(dt: datetime) -> list:
    """Return full 24-hour Hora schedule for the given day."""
    npt_dt = dt + timedelta(hours=5, minutes=45)
    vara_idx = (npt_dt.weekday() + 1) % 7
    start_planet_idx = HORA_START_IDX[vara_idx]

    schedule = []
    for h in range(24):
        planet_idx = (start_planet_idx + h) % 7
        planet = HORA_PLANETS[planet_idx]
        schedule.append({
            'hour': h,
            'time_label': f"{h:02d}:00–{(h+1)%24:02d}:00 NPT",
            'planet': planet,
            'planet_np': HORA_PLANET_NP[planet_idx],
            'color': HORA_COLORS[planet],
            'meaning': HORA_MEANINGS[planet],
            'is_current': h == npt_dt.hour,
        })
    return schedule
