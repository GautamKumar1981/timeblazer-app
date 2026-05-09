"""
Vimshottari Dasha calculator for Nepali Jyotish.
120-year cycle starting from the Moon's Nakshatra at birth.
"""

from datetime import date, timedelta

DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
DASHA_YEARS = {'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17}
DASHA_TOTAL = 120

DASHA_PLANET_NP = {
    'Ketu': 'केतु', 'Venus': 'शुक्र', 'Sun': 'सूर्य', 'Moon': 'चन्द्र',
    'Mars': 'मंगल', 'Rahu': 'राहु', 'Jupiter': 'बृहस्पति', 'Saturn': 'शनि', 'Mercury': 'बुध',
}
DASHA_COLORS = {
    'Ketu': '#6b7280', 'Venus': '#ec4899', 'Sun': '#f59e0b', 'Moon': '#818cf8',
    'Mars': '#ef4444', 'Rahu': '#374151', 'Jupiter': '#f97316', 'Saturn': '#475569', 'Mercury': '#10b981',
}
DASHA_MEANINGS = {
    'Ketu':    'Spirituality, detachment, past karma. Focus on inner growth, let go of materialism.',
    'Venus':   'Relationships, beauty, wealth, pleasure. Time for love, art, and material abundance.',
    'Sun':     'Self, authority, confidence. Focus on leadership, health, and personal identity.',
    'Moon':    'Mind, emotions, mother, public. Focus on emotional intelligence and nurturing.',
    'Mars':    'Action, courage, property, siblings. High energy — push for goals, avoid aggression.',
    'Rahu':    'Ambition, materialism, foreign influences, technology. Rapid changes and opportunities.',
    'Jupiter': 'Wisdom, expansion, fortune, children. Excellent for education, spirituality, growth.',
    'Saturn':  'Discipline, karma, delays, longevity. Hard work yields rewards; patience required.',
    'Mercury': 'Intellect, communication, business, education. Excellent for learning and trade.',
}

# Nakshatra to starting Dasha planet mapping
# 27 Nakshatras mapped to the 9 Dashas in order (3 per Dasha)
NAKSHATRA_DASHA = {
    0:  'Ketu',    # Ashwini
    1:  'Venus',   # Bharani
    2:  'Sun',     # Krittika
    3:  'Moon',    # Rohini
    4:  'Mars',    # Mrigashira
    5:  'Rahu',    # Ardra
    6:  'Jupiter', # Punarvasu
    7:  'Saturn',  # Pushya
    8:  'Mercury', # Ashlesha
    9:  'Ketu',    # Magha
    10: 'Venus',   # Purva Phalguni
    11: 'Sun',     # Uttara Phalguni
    12: 'Moon',    # Hasta
    13: 'Mars',    # Chitra
    14: 'Rahu',    # Swati
    15: 'Jupiter', # Vishakha
    16: 'Saturn',  # Anuradha
    17: 'Mercury', # Jyeshtha
    18: 'Ketu',    # Mula
    19: 'Venus',   # Purva Ashadha
    20: 'Sun',     # Uttara Ashadha
    21: 'Moon',    # Shravana
    22: 'Mars',    # Dhanishtha
    23: 'Rahu',    # Shatabhisha
    24: 'Jupiter', # Purva Bhadrapada
    25: 'Saturn',  # Uttara Bhadrapada
    26: 'Mercury', # Revati
}

# Each Nakshatra spans 13°20' = 800 arcmin
NAK_SPAN_DEG = 360 / 27  # ≈ 13.333°


def calculate_dasha(birth_date: date, birth_moon_longitude: float) -> dict:
    """
    Calculate Vimshottari Dasha periods from birth Moon longitude.

    birth_moon_longitude: sidereal Moon longitude in degrees at birth
    Returns current Mahadasha, Antardasha, and full timeline.
    """
    nakshatra_idx = int(birth_moon_longitude / NAK_SPAN_DEG) % 27
    degree_in_nak = birth_moon_longitude % NAK_SPAN_DEG

    # Starting Dasha planet
    start_planet = NAKSHATRA_DASHA[nakshatra_idx]
    start_planet_idx = DASHA_ORDER.index(start_planet)

    # Fraction of first Dasha elapsed at birth
    fraction_elapsed = degree_in_nak / NAK_SPAN_DEG
    first_dasha_years = DASHA_YEARS[start_planet]
    years_elapsed = fraction_elapsed * first_dasha_years

    # Build Mahadasha timeline
    dashas = []
    current_start = birth_date - timedelta(days=years_elapsed * 365.25)

    for i in range(9):
        planet = DASHA_ORDER[(start_planet_idx + i) % 9]
        duration_years = DASHA_YEARS[planet]
        duration_days = int(duration_years * 365.25)
        dasha_end = current_start + timedelta(days=duration_days)

        dashas.append({
            'planet': planet,
            'planet_np': DASHA_PLANET_NP[planet],
            'color': DASHA_COLORS[planet],
            'meaning': DASHA_MEANINGS[planet],
            'years': duration_years,
            'start': current_start.isoformat(),
            'end': dasha_end.isoformat(),
        })
        current_start = dasha_end

    # Determine current Mahadasha
    today = date.today()
    current_dasha = next(
        (d for d in dashas if date.fromisoformat(d['start']) <= today < date.fromisoformat(d['end'])),
        dashas[0]
    )

    # Antardasha within current Mahadasha
    maha_planet = current_dasha['planet']
    maha_planet_idx = DASHA_ORDER.index(maha_planet)
    maha_start = date.fromisoformat(current_dasha['start'])
    maha_total_days = (date.fromisoformat(current_dasha['end']) - maha_start).days

    antardashas = []
    antar_start = maha_start
    for i in range(9):
        antar_planet = DASHA_ORDER[(maha_planet_idx + i) % 9]
        antar_years = DASHA_YEARS[maha_planet] * DASHA_YEARS[antar_planet] / DASHA_TOTAL
        antar_days = int(antar_years * 365.25)
        antar_end = antar_start + timedelta(days=antar_days)
        antardashas.append({
            'planet': antar_planet,
            'planet_np': DASHA_PLANET_NP[antar_planet],
            'color': DASHA_COLORS[antar_planet],
            'years': round(antar_years, 2),
            'start': antar_start.isoformat(),
            'end': antar_end.isoformat(),
        })
        antar_start = antar_end

    current_antardasha = next(
        (a for a in antardashas if date.fromisoformat(a['start']) <= today < date.fromisoformat(a['end'])),
        antardashas[0]
    )

    return {
        'birth_nakshatra_index': nakshatra_idx,
        'birth_dasha_planet': start_planet,
        'mahadashas': dashas,
        'current_mahadasha': current_dasha,
        'antardashas': antardashas,
        'current_antardasha': current_antardasha,
        'summary': (
            f"You are currently in {current_dasha['planet']} Mahadasha "
            f"({current_dasha['start'][:4]}–{current_dasha['end'][:4]}), "
            f"sub-period of {current_antardasha['planet']} Antardasha "
            f"(until {current_antardasha['end'][:10]})."
        ),
    }
