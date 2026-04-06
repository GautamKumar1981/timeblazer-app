import re
from datetime import date, timedelta


def get_week_start(d: date) -> date:
    """Return the Monday of the week containing the given date."""
    return d - timedelta(days=d.weekday())


def format_duration(minutes: int) -> str:
    """Format minutes as 'Xh Ym' string."""
    if minutes is None:
        return "0m"
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    if hours > 0:
        return f"{hours}h"
    return f"{mins}m"


def calculate_year_progress() -> float:
    """Return the percentage of the current year that has passed."""
    today = date.today()
    year_start = date(today.year, 1, 1)
    year_end = date(today.year, 12, 31)
    total_days = (year_end - year_start).days + 1
    elapsed_days = (today - year_start).days + 1
    return round((elapsed_days / total_days) * 100, 2)


def validate_hex_color(color: str) -> bool:
    """Validate that a string is a valid hex color code (e.g. #4F46E5 or #fff)."""
    if not color:
        return False
    pattern = r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
    return bool(re.match(pattern, color))
