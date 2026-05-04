from datetime import date
from app.bazi.elements import HEAVENLY_STEMS, EARTHLY_BRANCHES
from app.bazi.calculator import _year_pillar, _bazi_year

# Approximate 节 (Jié) solar-term boundaries used for luck-pillar distance
_JIE = [
    (2,  4),   # 立春
    (3,  6),   # 惊蛰
    (4,  5),   # 清明
    (5,  6),   # 立夏
    (6,  6),   # 芒种
    (7,  7),   # 小暑
    (8,  7),   # 立秋
    (9,  8),   # 白露
    (10, 8),   # 寒露
    (11, 7),   # 立冬
    (12, 7),   # 大雪
    (1,  6),   # 小寒  (next year)
]


def _all_jie_dates(year: int) -> list:
    dates = []
    for yr in (year - 1, year, year + 1):
        for m, d in _JIE:
            adj = yr + 1 if m == 1 else yr
            try:
                dates.append(date(adj, m, d))
            except ValueError:
                pass
    dates.sort()
    return dates


def _surrounding_jie(d: date):
    dates = _all_jie_dates(d.year)
    prev_jie = next_jie = None
    for t in dates:
        if t <= d:
            prev_jie = t
        elif next_jie is None:
            next_jie = t
    return prev_jie, next_jie


def calculate_luck_pillars(birth_date: date, gender: str,
                           month_stem: int, month_branch: int) -> dict:
    bazi_yr = _bazi_year(birth_date)
    yr_stem, _ = _year_pillar(bazi_yr)

    year_is_yang = (yr_stem % 2 == 0)   # 甲丙戊庚壬 are yang (even indices)
    forward = (year_is_yang and gender == 'M') or (not year_is_yang and gender == 'F')

    prev_jie, next_jie = _surrounding_jie(birth_date)

    if forward:
        days = (next_jie - birth_date).days if next_jie else 30
    else:
        days = (birth_date - prev_jie).days if prev_jie else 30

    start_age = round(days / 3.0, 1)

    pillars = []
    for i in range(1, 9):   # 8 luck pillars × 10 years = 80 years
        if forward:
            si = (month_stem   + i) % 10
            bi = (month_branch + i) % 12
        else:
            si = (month_stem   - i + 100) % 10
            bi = (month_branch - i + 120) % 12

        age_start = round(start_age + (i - 1) * 10, 1)
        age_end   = round(age_start + 10, 1)

        pillars.append({
            'stem':       HEAVENLY_STEMS[si],
            'branch':     EARTHLY_BRANCHES[bi],
            'name':       HEAVENLY_STEMS[si]['cn'] + EARTHLY_BRANCHES[bi]['cn'],
            'age_start':  age_start,
            'age_end':    age_end,
            'decade':     i,
        })

    return {
        'direction': 'forward' if forward else 'backward',
        'start_age': start_age,
        'pillars':   pillars,
    }
