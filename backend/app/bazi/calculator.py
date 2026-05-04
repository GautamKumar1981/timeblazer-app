from datetime import date
from app.bazi.elements import (
    HEAVENLY_STEMS, EARTHLY_BRANCHES, HIDDEN_STEMS,
    PRODUCTION, DESTRUCTION, ELEMENTS,
)

# ── Day pillar reference: Jan 7 2000 = 甲子 (stem 0, branch 0) ──────────────
_REF_DATE   = date(2000, 1, 7)
_REF_STEM   = 0   # 甲
_REF_BRANCH = 0   # 子


def _day_stem_branch(d: date):
    delta = (d - _REF_DATE).days
    return delta % 10, delta % 12


# ── Li Chun (立春) approximate date: Feb 4 each year ────────────────────────
def _li_chun(year: int) -> date:
    return date(year, 2, 4)


def _bazi_year(d: date) -> int:
    return d.year if d >= _li_chun(d.year) else d.year - 1


# ── Year pillar ───────────────────────────────────────────────────────────────
def _year_pillar(bazi_yr: int):
    return (bazi_yr - 4) % 10, (bazi_yr - 4) % 12


# ── Month branch from approximate solar-term boundaries ───────────────────────
# Each tuple: (branch_index, start_month, start_day)
_MONTH_BOUNDS = [
    (2,  2,  4),   # 立春  → Tiger
    (3,  3,  6),   # 惊蛰  → Rabbit
    (4,  4,  5),   # 清明  → Dragon
    (5,  5,  6),   # 立夏  → Snake
    (6,  6,  6),   # 芒种  → Horse
    (7,  7,  7),   # 小暑  → Goat
    (8,  8,  7),   # 立秋  → Monkey
    (9,  9,  8),   # 白露  → Rooster
    (10, 10, 8),   # 寒露  → Dog
    (11, 11, 7),   # 立冬  → Pig
    (0,  12, 7),   # 大雪  → Rat
    (1,  1,  6),   # 小寒  → Ox  (previous year for Jan dates)
]


def _month_branch(d: date) -> int:
    yr = d.year
    # Walk backwards through boundaries, return first that applies
    for branch, m, day in reversed(_MONTH_BOUNDS):
        adj_yr = yr - 1 if m == 1 else yr
        try:
            boundary = date(adj_yr, m, day)
        except ValueError:
            continue
        if d >= boundary:
            return branch
    return 1  # fallback: Ox


# ── Month stem (五虎遁年起月 rule) ────────────────────────────────────────────
# For 寅月 (branch 2), base stem per year-stem-group:
# 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
_MONTH_BASE = [2, 4, 6, 8, 0]  # indexed by year_stem % 5


def _month_pillar(d: date):
    bazi_yr  = _bazi_year(d)
    yr_stem, _ = _year_pillar(bazi_yr)
    mb = _month_branch(d)
    month_in_year = (mb - 2 + 12) % 12          # Tiger = 0
    ms = (_MONTH_BASE[yr_stem % 5] + month_in_year) % 10
    return ms, mb


# ── Hour branch and stem ──────────────────────────────────────────────────────
def _hour_branch(hour: int) -> int:
    if hour == 23:
        return 0   # 子
    return (hour + 1) // 2


# 五鼠遁日起时 rule: starting stem for 子时 based on day stem
_HOUR_BASE = [0, 2, 4, 6, 8]  # indexed by day_stem % 5


def _hour_pillar(d: date, hour: int):
    ds, _ = _day_stem_branch(d)
    hb = _hour_branch(hour)
    hs = (_HOUR_BASE[ds % 5] + hb) % 10
    return hs, hb


# ── Format a single pillar ────────────────────────────────────────────────────
def _fmt(si: int, bi: int) -> dict:
    stem   = HEAVENLY_STEMS[si]
    branch = EARTHLY_BRANCHES[bi]
    hidden = [HEAVENLY_STEMS[i] for i in HIDDEN_STEMS.get(bi, [])]
    return {
        'stem':         stem,
        'branch':       branch,
        'hidden_stems': hidden,
        'name':         stem['cn'] + branch['cn'],
        'stem_index':   si,
        'branch_index': bi,
    }


# ── Element balance across all pillars ───────────────────────────────────────
def _element_balance(pillars: list) -> dict:
    counts = {e: 0 for e in ELEMENTS}
    for p in pillars:
        counts[p['stem']['element']]   += 2   # stems weighted double
        counts[p['branch']['element']] += 1
        if p['hidden_stems']:
            counts[p['hidden_stems'][0]['element']] += 1
    return counts


# ── Determine favorable / unfavorable elements ───────────────────────────────
def _favorable(dm_elem: str, balance: dict, month_branch: int):
    month_elem = EARTHLY_BRANCHES[month_branch]['element']
    # Is the DM supported by the ruling month element?
    supported = (month_elem == dm_elem or PRODUCTION.get(month_elem) == dm_elem)
    total     = sum(balance.values()) or 1
    dm_ratio  = balance.get(dm_elem, 0) / total
    strong    = supported and dm_ratio > 0.25

    if strong:
        # DM needs outlets: output (what DM produces) and wealth (what DM destroys)
        fav   = [PRODUCTION[dm_elem], DESTRUCTION[dm_elem]]
        unfav = [dm_elem]
    else:
        # Weak DM needs resource (what produces DM) and same-element support
        resource = next(e for e, p in PRODUCTION.items() if p == dm_elem)
        fav   = [resource, dm_elem]
        unfav = [DESTRUCTION[dm_elem]]   # what DM is controlled by

    return fav, unfav, strong


# ── Public API ────────────────────────────────────────────────────────────────
def calculate_chart(birth_date: date, birth_hour: int, gender: str) -> dict:
    bazi_yr = _bazi_year(birth_date)
    ys, yb  = _year_pillar(bazi_yr)
    ms, mb  = _month_pillar(birth_date)
    ds, db  = _day_stem_branch(birth_date)
    hs, hb  = _hour_pillar(birth_date, birth_hour)

    year_p  = _fmt(ys, yb)
    month_p = _fmt(ms, mb)
    day_p   = _fmt(ds, db)
    hour_p  = _fmt(hs, hb)
    pillars = [year_p, month_p, day_p, hour_p]

    dm         = HEAVENLY_STEMS[ds]
    dm_elem    = dm['element']
    balance    = _element_balance(pillars)
    fav, unfav, strong = _favorable(dm_elem, balance, mb)

    return {
        'year':                year_p,
        'month':               month_p,
        'day':                 day_p,
        'hour':                hour_p,
        'day_master':          dm,
        'day_master_element':  dm_elem,
        'day_master_strength': 'Strong' if strong else 'Weak',
        'element_balance':     balance,
        'favorable_elements':  fav,
        'unfavorable_elements': unfav,
        'bazi_year':           bazi_yr,
        'gender':              gender,
    }
