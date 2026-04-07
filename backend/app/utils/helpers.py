from datetime import date, timedelta
from typing import List


def format_duration(minutes: int) -> str:
    """Convert a duration in minutes to a human-readable string."""
    if minutes < 60:
        return f'{minutes}m'
    hours = minutes // 60
    remaining = minutes % 60
    if remaining:
        return f'{hours}h {remaining}m'
    return f'{hours}h'


def get_week_start(target_date: date) -> date:
    """Return the Monday of the week containing target_date."""
    return target_date - timedelta(days=target_date.weekday())


def get_date_range(start: date, end: date) -> List[date]:
    """Return a list of dates from start to end (inclusive)."""
    dates = []
    current = start
    while current <= end:
        dates.append(current)
        current += timedelta(days=1)
    return dates
