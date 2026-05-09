"""
Simplified astronomical calculations for Vedic/Nepali Jyotish.
Computes sidereal Sun and Moon longitudes using Lahiri ayanamsha.
Accurate to ~0.3° for dates 2000-2040 — sufficient for Panchang.
Formulas from Jean Meeus "Astronomical Algorithms" (simplified).
"""

import math
from datetime import datetime, timezone


def _julian_day(dt: datetime) -> float:
    """Convert a UTC datetime to Julian Day Number."""
    a = (14 - dt.month) // 12
    y = dt.year + 4800 - a
    m = dt.month + 12 * a - 3
    jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
    frac = (dt.hour + dt.minute / 60 + dt.second / 3600) / 24 - 0.5
    return jdn + frac


def _normalize(deg: float) -> float:
    """Normalize degrees to [0, 360)."""
    return deg % 360


def sun_longitude(dt: datetime) -> float:
    """Tropical (ecliptic) longitude of the Sun in degrees."""
    jd = _julian_day(dt)
    T = (jd - 2451545.0) / 36525  # Julian centuries from J2000.0

    # Geometric mean longitude of the Sun
    L0 = _normalize(280.46646 + 36000.76983 * T + 0.0003032 * T * T)

    # Mean anomaly of the Sun
    M = _normalize(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
    M_rad = math.radians(M)

    # Equation of center
    C = ((1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(M_rad)
         + (0.019993 - 0.000101 * T) * math.sin(2 * M_rad)
         + 0.000289 * math.sin(3 * M_rad))

    # Sun's true longitude
    sun_lon = _normalize(L0 + C)
    return sun_lon


def moon_longitude(dt: datetime) -> float:
    """Tropical (ecliptic) longitude of the Moon in degrees."""
    jd = _julian_day(dt)
    T = (jd - 2451545.0) / 36525

    # Moon's mean longitude
    L = _normalize(218.3164477 + 481267.88123421 * T
                   - 0.0015786 * T * T + T * T * T / 538841
                   - T * T * T * T / 65194000)

    # Moon's mean anomaly
    M_moon = _normalize(134.9633964 + 477198.8675055 * T
                        + 0.0087414 * T * T + T * T * T / 69699
                        - T * T * T * T / 14712000)

    # Sun's mean anomaly
    M_sun = _normalize(357.5291092 + 35999.0502909 * T
                       - 0.0001536 * T * T + T * T * T / 24490000)

    # Moon's argument of latitude
    F = _normalize(93.2720950 + 483202.0175233 * T
                   - 0.0036539 * T * T - T * T * T / 3526000
                   + T * T * T * T / 863310000)

    # Mean elongation of Moon from Sun
    D = _normalize(297.8501921 + 445267.1114034 * T
                   - 0.0018819 * T * T + T * T * T / 545868
                   - T * T * T * T / 113065000)

    # Convert to radians
    L_r = math.radians(L)
    M_m_r = math.radians(M_moon)
    M_s_r = math.radians(M_sun)
    F_r = math.radians(F)
    D_r = math.radians(D)

    # Longitude perturbations (main terms only)
    sigma_l = (6288774 * math.sin(M_m_r)
               + 1274027 * math.sin(2 * D_r - M_m_r)
               + 658314 * math.sin(2 * D_r)
               + 213618 * math.sin(2 * M_m_r)
               - 185116 * math.sin(M_s_r)
               - 114332 * math.sin(2 * F_r)
               + 58793 * math.sin(2 * D_r - 2 * M_m_r)
               + 57066 * math.sin(2 * D_r - M_s_r - M_m_r)
               + 53322 * math.sin(2 * D_r + M_m_r)
               + 45758 * math.sin(2 * D_r - M_s_r)
               - 40923 * math.sin(M_s_r - M_m_r)
               - 34720 * math.sin(D_r)
               - 30383 * math.sin(M_s_r + M_m_r)
               + 15327 * math.sin(2 * D_r - 2 * F_r)
               - 12528 * math.sin(2 * F_r + M_m_r))

    moon_lon = _normalize(L + sigma_l / 1000000)
    return moon_lon


def lahiri_ayanamsha(dt: datetime) -> float:
    """Lahiri ayanamsha for the given date (degrees to subtract from tropical longitude)."""
    jd = _julian_day(dt)
    T = (jd - 2451545.0) / 36525
    # Standard Lahiri formula
    return 23.85 + 0.013611 * T + 0.0000014 * T * T


def sidereal_sun(dt: datetime) -> float:
    """Sidereal Sun longitude (Lahiri ayanamsha corrected)."""
    return _normalize(sun_longitude(dt) - lahiri_ayanamsha(dt))


def sidereal_moon(dt: datetime) -> float:
    """Sidereal Moon longitude (Lahiri ayanamsha corrected)."""
    return _normalize(moon_longitude(dt) - lahiri_ayanamsha(dt))
