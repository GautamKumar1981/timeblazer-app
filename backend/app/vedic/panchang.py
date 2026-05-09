"""
Vedic Panchang calculator.
Computes all five limbs: Tithi, Vara, Nakshatra, Yoga, Karana.
"""

from datetime import datetime, timezone, date as date_type
from .astronomy import sidereal_sun, sidereal_moon
from .bikram_sambat import ad_to_bs, BS_MONTH_NAMES_EN, BS_MONTH_NAMES_NP

# ── Tithi ─────────────────────────────────────────────────────────────────────

TITHI_NAMES_EN = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
]
TITHI_NAMES_NP = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या',
]
PAKSHA_SHUKLA = 'Shukla Paksha'   # Waxing / Bright half
PAKSHA_KRISHNA = 'Krishna Paksha'  # Waning / Dark half


def get_tithi(sun_lon: float, moon_lon: float) -> dict:
    """Return Tithi info from sidereal Sun and Moon longitudes."""
    diff = (moon_lon - sun_lon) % 360
    tithi_num = int(diff / 12) + 1  # 1-30
    if tithi_num <= 15:
        paksha = PAKSHA_SHUKLA
        idx = tithi_num - 1
        name_en = TITHI_NAMES_EN[idx]
        name_np = TITHI_NAMES_NP[idx]
        if tithi_num == 15:
            name_en = 'Purnima'
            name_np = 'पूर्णिमा'
    else:
        paksha = PAKSHA_KRISHNA
        idx = tithi_num - 16
        name_en = TITHI_NAMES_EN[idx] if idx < 14 else 'Amavasya'
        name_np = TITHI_NAMES_NP[idx] if idx < 14 else 'अमावस्या'
        if tithi_num == 30:
            name_en = 'Amavasya'
            name_np = 'अमावस्या'

    # Auspiciousness
    auspicious_tithis = {1, 2, 3, 5, 7, 10, 11, 12, 13}
    inauspicious_tithis = {4, 6, 8, 9, 14, 30}
    auspicious = tithi_num in auspicious_tithis
    inauspicious = tithi_num in inauspicious_tithis

    return {
        'number': tithi_num,
        'name_en': name_en,
        'name_np': name_np,
        'paksha': paksha,
        'auspicious': auspicious,
        'inauspicious': inauspicious,
    }


# ── Vara (Weekday) ────────────────────────────────────────────────────────────

VARA_DATA = [
    {'en': 'Ravivar',        'np': 'आइतबार',   'planet': 'Sun',     'planet_np': 'सूर्य',    'good_for': 'Health, vitality, government matters'},
    {'en': 'Sombar',         'np': 'सोमबार',   'planet': 'Moon',    'planet_np': 'चन्द्र',   'good_for': 'Emotions, public relations, travel'},
    {'en': 'Mangalbar',      'np': 'मंगलबार',  'planet': 'Mars',    'planet_np': 'मंगल',     'good_for': 'Courage, property, surgery'},
    {'en': 'Budhabar',       'np': 'बुधबार',   'planet': 'Mercury', 'planet_np': 'बुध',      'good_for': 'Communication, writing, business, education'},
    {'en': 'Bihibar',        'np': 'बिहीबार',  'planet': 'Jupiter', 'planet_np': 'बृहस्पति', 'good_for': 'Wisdom, finance, law, teaching'},
    {'en': 'Sukrabar',       'np': 'शुक्रबार', 'planet': 'Venus',   'planet_np': 'शुक्र',    'good_for': 'Arts, relationships, beauty, marriage'},
    {'en': 'Shanibar',       'np': 'शनिबार',   'planet': 'Saturn',  'planet_np': 'शनि',      'good_for': 'Hard work, discipline, long-term plans'},
]

AUSPICIOUS_VARA = {1, 3, 4}  # 0-indexed: Sun=0, Mon=1 ... so Wed=3, Thu=4, Fri=5 auspicious
# Actually: Mon=1, Wed=3, Thu=4, Fri=5 are auspicious for new beginnings
AUSPICIOUS_VARA_IDX = {1, 3, 4, 5}


def get_vara(weekday: int) -> dict:
    """weekday: 0=Monday (Python convention). Returns Vara info."""
    # Python weekday(): 0=Monday, 6=Sunday. We need Sunday=0.
    # Convert: Python 0(Mon)->1, 1(Tue)->2, ..., 6(Sun)->0
    vara_idx = (weekday + 1) % 7  # 0=Sun, 1=Mon, ..., 6=Sat
    data = VARA_DATA[vara_idx]
    return {
        **data,
        'index': vara_idx,
        'auspicious': vara_idx in AUSPICIOUS_VARA_IDX,
    }


# ── Nakshatra ────────────────────────────────────────────────────────────────

NAKSHATRAS = [
    {'en': 'Ashwini',     'np': 'अश्विनी',    'planet': 'Ketu',    'quality': 'auspicious'},
    {'en': 'Bharani',     'np': 'भरणी',       'planet': 'Venus',   'quality': 'mixed'},
    {'en': 'Krittika',    'np': 'कृत्तिका',   'planet': 'Sun',     'quality': 'mixed'},
    {'en': 'Rohini',      'np': 'रोहिणी',     'planet': 'Moon',    'quality': 'auspicious'},
    {'en': 'Mrigashira',  'np': 'मृगशिरा',   'planet': 'Mars',    'quality': 'auspicious'},
    {'en': 'Ardra',       'np': 'आर्द्रा',    'planet': 'Rahu',    'quality': 'inauspicious'},
    {'en': 'Punarvasu',   'np': 'पुनर्वसु',   'planet': 'Jupiter', 'quality': 'auspicious'},
    {'en': 'Pushya',      'np': 'पुष्य',      'planet': 'Saturn',  'quality': 'auspicious'},
    {'en': 'Ashlesha',    'np': 'आश्लेषा',    'planet': 'Mercury', 'quality': 'inauspicious'},
    {'en': 'Magha',       'np': 'मघा',        'planet': 'Ketu',    'quality': 'mixed'},
    {'en': 'Purva Phalguni', 'np': 'पूर्व फाल्गुनी', 'planet': 'Venus', 'quality': 'auspicious'},
    {'en': 'Uttara Phalguni', 'np': 'उत्तर फाल्गुनी', 'planet': 'Sun', 'quality': 'auspicious'},
    {'en': 'Hasta',       'np': 'हस्त',       'planet': 'Moon',    'quality': 'auspicious'},
    {'en': 'Chitra',      'np': 'चित्रा',     'planet': 'Mars',    'quality': 'auspicious'},
    {'en': 'Swati',       'np': 'स्वाति',     'planet': 'Rahu',    'quality': 'auspicious'},
    {'en': 'Vishakha',    'np': 'विशाखा',     'planet': 'Jupiter', 'quality': 'mixed'},
    {'en': 'Anuradha',    'np': 'अनुराधा',    'planet': 'Saturn',  'quality': 'auspicious'},
    {'en': 'Jyeshtha',    'np': 'ज्येष्ठा',   'planet': 'Mercury', 'quality': 'inauspicious'},
    {'en': 'Mula',        'np': 'मूल',        'planet': 'Ketu',    'quality': 'inauspicious'},
    {'en': 'Purva Ashadha', 'np': 'पूर्व आषाढा', 'planet': 'Venus', 'quality': 'mixed'},
    {'en': 'Uttara Ashadha', 'np': 'उत्तर आषाढा', 'planet': 'Sun', 'quality': 'auspicious'},
    {'en': 'Shravana',    'np': 'श्रवण',      'planet': 'Moon',    'quality': 'auspicious'},
    {'en': 'Dhanishtha',  'np': 'धनिष्ठा',   'planet': 'Mars',    'quality': 'auspicious'},
    {'en': 'Shatabhisha', 'np': 'शतभिषा',    'planet': 'Rahu',    'quality': 'mixed'},
    {'en': 'Purva Bhadrapada', 'np': 'पूर्व भाद्रपदा', 'planet': 'Jupiter', 'quality': 'mixed'},
    {'en': 'Uttara Bhadrapada', 'np': 'उत्तर भाद्रपदा', 'planet': 'Saturn', 'quality': 'auspicious'},
    {'en': 'Revati',      'np': 'रेवती',      'planet': 'Mercury', 'quality': 'auspicious'},
]

NAKSHATRA_MEANINGS = {
    'Ashwini': 'New beginnings, speed, healing. Good for starting projects, medical treatment.',
    'Bharani': 'Transformation, creativity. Mixed energy — avoid major decisions.',
    'Krittika': 'Sharp, cutting energy. Good for decisive action and purification.',
    'Rohini': 'Growth, prosperity, creativity. Excellent for planting seeds — business or personal.',
    'Mrigashira': 'Searching, exploration. Great for research, travel, learning.',
    'Ardra': 'Storms and renewal. Avoid new beginnings — good for research into problems.',
    'Punarvasu': 'Return and renewal. Excellent for resuming paused projects, healing.',
    'Pushya': 'Nourishment and expansion. One of the most auspicious — great for all activities.',
    'Ashlesha': 'Subtle, covert energy. Avoid important decisions; good for introspection.',
    'Magha': 'Royalty and authority. Good for leadership, connecting with elders.',
    'Purva Phalguni': 'Pleasure, rest, relationships. Good for creative and social activities.',
    'Uttara Phalguni': 'Patronage and friendship. Excellent for partnerships and agreements.',
    'Hasta': 'Skill and craftsmanship. Great for detailed work, crafts, healing.',
    'Chitra': 'Brilliance and beauty. Excellent for artistic, creative, and designing activities.',
    'Swati': 'Independence, flexibility. Good for business, trade, new ventures.',
    'Vishakha': 'Focus and achievement. Good for goal-setting; avoid confrontation.',
    'Anuradha': 'Devotion and friendship. Excellent for teamwork, partnerships, spiritual practice.',
    'Jyeshtha': 'Seniority and authority. Mixed — good for experienced leaders only.',
    'Mula': 'Root and foundation. Avoid new starts; good for investigation and research.',
    'Purva Ashadha': 'Invincibility. Good for competitive activities and purification.',
    'Uttara Ashadha': 'Final victory. Excellent for completing long-term projects.',
    'Shravana': 'Listening and learning. Excellent for education, communication, travel.',
    'Dhanishtha': 'Abundance and music. Great for wealth-building and creative arts.',
    'Shatabhisha': 'Healing and mystery. Good for medical treatment and research.',
    'Purva Bhadrapada': 'Fiery and intense. Mixed — use for intense focus only.',
    'Uttara Bhadrapada': 'Depth and wisdom. Excellent for spiritual practice and teaching.',
    'Revati': 'Completion and nourishment. Great for finishing projects and nurturing others.',
}


def get_nakshatra(moon_lon: float) -> dict:
    """Return Nakshatra info from sidereal Moon longitude."""
    idx = int(moon_lon / (360 / 27))  # Each nakshatra = 13°20'
    idx = idx % 27
    nak = NAKSHATRAS[idx]
    return {
        **nak,
        'index': idx,
        'meaning': NAKSHATRA_MEANINGS.get(nak['en'], ''),
        'degree_in_nakshatra': round(moon_lon % (360 / 27), 2),
    }


# ── Yoga ─────────────────────────────────────────────────────────────────────

YOGAS = [
    {'en': 'Vishkumbha',  'np': 'विष्कुम्भ', 'quality': 'inauspicious'},
    {'en': 'Priti',       'np': 'प्रीति',     'quality': 'auspicious'},
    {'en': 'Ayushman',    'np': 'आयुष्मान',   'quality': 'auspicious'},
    {'en': 'Saubhagya',   'np': 'सौभाग्य',    'quality': 'auspicious'},
    {'en': 'Shobhana',    'np': 'शोभन',       'quality': 'auspicious'},
    {'en': 'Atiganda',    'np': 'अतिगण्ड',    'quality': 'inauspicious'},
    {'en': 'Sukarman',    'np': 'सुकर्मा',    'quality': 'auspicious'},
    {'en': 'Dhriti',      'np': 'धृति',       'quality': 'auspicious'},
    {'en': 'Shula',       'np': 'शूल',        'quality': 'inauspicious'},
    {'en': 'Ganda',       'np': 'गण्ड',       'quality': 'inauspicious'},
    {'en': 'Vriddhi',     'np': 'वृद्धि',     'quality': 'auspicious'},
    {'en': 'Dhruva',      'np': 'ध्रुव',      'quality': 'auspicious'},
    {'en': 'Vyaghata',    'np': 'व्याघात',    'quality': 'inauspicious'},
    {'en': 'Harshana',    'np': 'हर्षण',      'quality': 'auspicious'},
    {'en': 'Vajra',       'np': 'वज्र',       'quality': 'mixed'},
    {'en': 'Siddhi',      'np': 'सिद्धि',     'quality': 'auspicious'},
    {'en': 'Vyatipata',   'np': 'व्यतिपात',   'quality': 'inauspicious'},
    {'en': 'Variyan',     'np': 'वरीयान',     'quality': 'auspicious'},
    {'en': 'Parigha',     'np': 'परिघ',       'quality': 'mixed'},
    {'en': 'Shiva',       'np': 'शिव',        'quality': 'auspicious'},
    {'en': 'Siddha',      'np': 'सिद्ध',      'quality': 'auspicious'},
    {'en': 'Sadhya',      'np': 'साध्य',      'quality': 'auspicious'},
    {'en': 'Shubha',      'np': 'शुभ',        'quality': 'auspicious'},
    {'en': 'Shukla',      'np': 'शुक्ल',      'quality': 'auspicious'},
    {'en': 'Brahma',      'np': 'ब्रह्म',     'quality': 'auspicious'},
    {'en': 'Mahendra',    'np': 'महेन्द्र',   'quality': 'auspicious'},
    {'en': 'Vaidhriti',   'np': 'वैधृति',     'quality': 'inauspicious'},
]


def get_yoga(sun_lon: float, moon_lon: float) -> dict:
    """Return Yoga info from sidereal Sun + Moon longitude sum."""
    combined = (sun_lon + moon_lon) % 360
    idx = int(combined / (360 / 27))
    idx = idx % 27
    yoga = YOGAS[idx]
    return {**yoga, 'index': idx}


# ── Karana ────────────────────────────────────────────────────────────────────

# 11 Karanas: 4 fixed + 7 repeating
FIXED_KARANAS = [
    {'en': 'Kimstughna', 'np': 'किंस्तुघ्न', 'quality': 'auspicious'},
    {'en': 'Shakuni',    'np': 'शकुनि',      'quality': 'mixed'},
    {'en': 'Chatushpada','np': 'चतुष्पाद',   'quality': 'mixed'},
    {'en': 'Naga',       'np': 'नाग',        'quality': 'inauspicious'},
]
REPEATING_KARANAS = [
    {'en': 'Bava',    'np': 'बव',    'quality': 'auspicious'},
    {'en': 'Balava',  'np': 'बालव',  'quality': 'auspicious'},
    {'en': 'Kaulava', 'np': 'कौलव',  'quality': 'auspicious'},
    {'en': 'Taitila', 'np': 'तैतिल', 'quality': 'auspicious'},
    {'en': 'Garaja',  'np': 'गरज',   'quality': 'auspicious'},
    {'en': 'Vanija',  'np': 'वणिज',  'quality': 'auspicious'},
    {'en': 'Vishti',  'np': 'विष्टि', 'quality': 'inauspicious'},
]


def get_karana(sun_lon: float, moon_lon: float) -> dict:
    """Return Karana info. Each Karana = half a Tithi (6° Moon-Sun difference)."""
    diff = (moon_lon - sun_lon) % 360
    karana_num = int(diff / 6)  # 0-59

    # First karana is Kimstughna (fixed)
    if karana_num == 0:
        k = FIXED_KARANAS[0]
    elif karana_num == 57:
        k = FIXED_KARANAS[1]  # Shakuni
    elif karana_num == 58:
        k = FIXED_KARANAS[2]  # Chatushpada
    elif karana_num == 59:
        k = FIXED_KARANAS[3]  # Naga
    else:
        k = REPEATING_KARANAS[(karana_num - 1) % 7]

    is_vishti = k['en'] == 'Vishti'
    return {
        **k,
        'number': karana_num + 1,
        'is_vishti': is_vishti,
        'note': 'Avoid starting new work during Vishti (Bhadra) Karana.' if is_vishti else '',
    }


# ── Main Panchang ─────────────────────────────────────────────────────────────

def get_panchang(dt: datetime, location: str = 'Kathmandu') -> dict:
    """
    Compute full Panchang for a given UTC datetime.
    Returns all five limbs plus BS date.
    """
    sun = sidereal_sun(dt)
    moon = sidereal_moon(dt)

    tithi = get_tithi(sun, moon)
    vara = get_vara(dt.weekday())
    nakshatra = get_nakshatra(moon)
    yoga = get_yoga(sun, moon)
    karana = get_karana(sun, moon)

    # BS date
    ad_date = dt.date() if hasattr(dt, 'date') else dt_type.today()
    try:
        bs_year, bs_month, bs_day = ad_to_bs(ad_date)
        bs_month_en = BS_MONTH_NAMES_EN[bs_month - 1]
        bs_month_np = BS_MONTH_NAMES_NP[bs_month - 1]
        bs_date_str = f"{bs_day} {bs_month_en} {bs_year}"
    except Exception:
        bs_year, bs_month, bs_day = 0, 0, 0
        bs_date_str = 'Unknown'
        bs_month_en = ''
        bs_month_np = ''

    # Overall auspiciousness
    auspicious_count = sum([
        tithi['auspicious'],
        vara['auspicious'],
        nakshatra['quality'] == 'auspicious',
        yoga['quality'] == 'auspicious',
        karana['quality'] == 'auspicious',
    ])
    inauspicious_count = sum([
        tithi['inauspicious'],
        not vara['auspicious'],
        nakshatra['quality'] == 'inauspicious',
        yoga['quality'] == 'inauspicious',
        karana['quality'] == 'inauspicious' or karana['is_vishti'],
    ])

    if auspicious_count >= 4:
        overall = 'Excellent'
        overall_color = '#065f46'
    elif auspicious_count >= 3:
        overall = 'Good'
        overall_color = '#16a34a'
    elif inauspicious_count >= 3:
        overall = 'Challenging'
        overall_color = '#dc2626'
    else:
        overall = 'Mixed'
        overall_color = '#d97706'

    return {
        'bs_year': bs_year,
        'bs_month': bs_month,
        'bs_day': bs_day,
        'bs_month_en': bs_month_en,
        'bs_month_np': bs_month_np,
        'bs_date_str': bs_date_str,
        'ad_date': ad_date.isoformat(),
        'location': location,
        'tithi': tithi,
        'vara': vara,
        'nakshatra': nakshatra,
        'yoga': yoga,
        'karana': karana,
        'overall': overall,
        'overall_color': overall_color,
        'sun_longitude': round(sun, 2),
        'moon_longitude': round(moon, 2),
    }
