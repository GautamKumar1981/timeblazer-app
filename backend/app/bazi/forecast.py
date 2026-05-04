from datetime import date, timedelta
from app.bazi.elements import HEAVENLY_STEMS, EARTHLY_BRANCHES, ELEMENTS
from app.bazi.calculator import _day_stem_branch, _hour_pillar, _fmt


def _elem_score(elem: str, fav: list, unfav: list) -> int:
    if elem in fav:
        return 2
    if elem in unfav:
        return -2
    return 0


def _score_to_rating(score: float):
    if score >= 75:
        return 'Auspicious',   '#22c55e'
    if score >= 45:
        return 'Neutral',      '#f59e0b'
    return 'Challenging',  '#ef4444'


def _day_info(d: date, fav: list, unfav: list) -> dict:
    si, bi = _day_stem_branch(d)
    stem   = HEAVENLY_STEMS[si]
    branch = EARTHLY_BRANCHES[bi]
    raw    = _elem_score(stem['element'], fav, unfav) + _elem_score(branch['element'], fav, unfav)
    score  = min(100, max(0, (raw + 4) * 12.5))
    rating, color = _score_to_rating(score)
    return {
        'date':   d.isoformat(),
        'pillar': _fmt(si, bi),
        'score':  score,
        'rating': rating,
        'color':  color,
    }


ELEM_TIPS = {
    'Wood':  'Great for starting projects, creative work, and growth initiatives.',
    'Fire':  'Ideal for networking, presentations, and high-visibility activities.',
    'Earth': 'Best for planning, organisation, consolidation, and property matters.',
    'Metal': 'Excellent for decisions, legal matters, contracts, and precision work.',
    'Water': 'Perfect for research, learning, travel, and adaptable negotiations.',
}

BUSINESS_ACTIVITIES = {
    'meeting':    {'name': 'Business Meeting',        'elements': ['Fire', 'Metal'], 'icon': '🤝', 'description': 'Fire brings clarity; Metal brings decisiveness.'},
    'contract':   {'name': 'Contract Signing',        'elements': ['Earth', 'Metal'],'icon': '📝', 'description': 'Earth ensures stability; Metal governs commitments.'},
    'launch':     {'name': 'Product / Business Launch','elements': ['Wood', 'Fire'], 'icon': '🚀', 'description': 'Wood sparks growth; Fire ignites momentum.'},
    'investment': {'name': 'Investment / Financial',   'elements': ['Earth', 'Metal'],'icon': '💰', 'description': 'Earth accumulates resources; Metal governs wealth.'},
    'travel':     {'name': 'Business Travel',          'elements': ['Water', 'Metal'],'icon': '✈️', 'description': 'Water brings flow; Metal gives direction.'},
    'hiring':     {'name': 'Hiring / Recruitment',     'elements': ['Wood', 'Earth'], 'icon': '👥', 'description': 'Wood grows teams; Earth grounds the organisation.'},
    'marketing':  {'name': 'Marketing / PR Campaign',  'elements': ['Fire', 'Wood'],  'icon': '📣', 'description': 'Fire creates visibility; Wood fuels creativity.'},
}


def get_daily_forecast(d: date, fav: list, unfav: list) -> dict:
    info = _day_info(d, fav, unfav)

    hours = []
    for branch_idx in range(12):      # iterate 子…亥 in order
        # Reconstruct the representative hour for this branch
        if branch_idx == 0:
            rep_hour = 23   # 子 period starts at 23:00
        else:
            rep_hour = branch_idx * 2 - 1   # mid of period

        hs, hb = _hour_pillar(d, rep_hour)
        h_stem   = HEAVENLY_STEMS[hs]
        h_branch = EARTHLY_BRANCHES[hb]
        raw      = _elem_score(h_stem['element'], fav, unfav) + _elem_score(h_branch['element'], fav, unfav)
        h_score  = min(100, max(0, (raw + 4) * 12.5))
        h_rating, h_color = _score_to_rating(h_score)

        hs_disp = h_branch['hour_start']
        he_disp = h_branch['hour_end']
        label   = f"{hs_disp:02d}:00–{he_disp:02d}:00"

        hours.append({
            'branch_index': branch_idx,
            'time_label':   label,
            'pillar_name':  h_stem['cn'] + h_branch['cn'],
            'stem':         h_stem,
            'branch':       h_branch,
            'score':        h_score,
            'rating':       h_rating,
            'color':        h_color,
        })

    info['hours'] = hours
    info['tips']  = [ELEM_TIPS[e] for e in fav if e in ELEM_TIPS]
    info['favorable_elements'] = fav
    return info


def get_calendar_month(year: int, month: int, fav: list, unfav: list) -> list:
    import calendar
    _, days = calendar.monthrange(year, month)
    return [_day_info(date(year, month, d), fav, unfav) for d in range(1, days + 1)]


def get_business_timing(activity_key: str, start: date, days_ahead: int,
                        fav: list, unfav: list) -> dict:
    act = BUSINESS_ACTIVITIES.get(activity_key)
    if not act:
        return {'error': 'Unknown activity'}

    act_elems = act['elements']
    recs = []

    for i in range(days_ahead):
        d = start + timedelta(days=i)
        si, bi = _day_stem_branch(d)
        day_elems = [HEAVENLY_STEMS[si]['element'], EARTHLY_BRANCHES[bi]['element']]

        act_match  = sum(1 for e in act_elems  if e in day_elems)
        pers_match = sum(1 for e in day_elems  if e in fav)
        total      = min(100, act_match * 40 + pers_match * 60)

        if total > 0:
            recs.append({
                'date':          d.isoformat(),
                'day_name':      d.strftime('%A, %b %-d'),
                'pillar':        _fmt(si, bi),
                'score':         total,
                'activity_match': act_match,
                'personal_match': pers_match,
                'day_elements':   day_elems,
            })

    recs.sort(key=lambda x: x['score'], reverse=True)
    return {'activity': act, 'recommendations': recs[:12]}
