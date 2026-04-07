from datetime import date, datetime, timedelta, timezone
from typing import List

from app import db
from app.models.analytics import Analytics
from app.models.timebox import Timebox
from app.utils.helpers import get_week_start, get_date_range


def calculate_daily_analytics(user_id: str, target_date: date) -> Analytics:
    """Calculate and persist analytics for a user on a given date."""
    start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
    end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=timezone.utc)

    timeboxes = Timebox.query.filter(
        Timebox.user_id == user_id,
        Timebox.start_time >= start,
        Timebox.start_time <= end,
    ).all()

    total = len(timeboxes)
    completed = sum(1 for t in timeboxes if t.status == 'completed')
    skipped = sum(1 for t in timeboxes if t.status == 'skipped')
    total_planned = sum(t.planned_duration for t in timeboxes)
    total_actual = sum((t.actual_duration or 0) for t in timeboxes if t.status == 'completed')
    accuracy = (completed / total * 100) if total > 0 else 0.0

    analytics = Analytics.query.filter_by(user_id=user_id, date=target_date).first()
    if not analytics:
        analytics = Analytics(user_id=user_id, date=target_date)
        db.session.add(analytics)

    analytics.total_timeboxes = total
    analytics.completed_count = completed
    analytics.skipped_count = skipped
    analytics.accuracy_percentage = accuracy
    analytics.total_planned_minutes = total_planned
    analytics.total_actual_minutes = total_actual
    db.session.commit()
    return analytics


def get_weekly_summary(user_id: str, week_start: date) -> dict:
    """Return aggregated analytics summary for a week."""
    dates = get_date_range(week_start, week_start + timedelta(days=6))
    records = Analytics.query.filter(
        Analytics.user_id == user_id,
        Analytics.date.in_(dates),
    ).all()

    if not records:
        return {
            'week_start': week_start.isoformat(),
            'total_timeboxes': 0,
            'completed_count': 0,
            'skipped_count': 0,
            'average_accuracy': 0.0,
            'total_planned_minutes': 0,
            'total_actual_minutes': 0,
            'daily_breakdown': [],
        }

    total = sum(r.total_timeboxes for r in records)
    completed = sum(r.completed_count for r in records)
    skipped = sum(r.skipped_count for r in records)
    total_planned = sum(r.total_planned_minutes for r in records)
    total_actual = sum(r.total_actual_minutes for r in records)
    avg_accuracy = (sum(r.accuracy_percentage for r in records) / len(records)) if records else 0.0

    return {
        'week_start': week_start.isoformat(),
        'total_timeboxes': total,
        'completed_count': completed,
        'skipped_count': skipped,
        'average_accuracy': round(avg_accuracy, 2),
        'total_planned_minutes': total_planned,
        'total_actual_minutes': total_actual,
        'daily_breakdown': [r.to_dict() for r in records],
    }


def get_monthly_summary(user_id: str, month: int, year: int) -> dict:
    """Return aggregated analytics for a full month."""
    import calendar
    _, days_in_month = calendar.monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, days_in_month)
    dates = get_date_range(start, end)

    records = Analytics.query.filter(
        Analytics.user_id == user_id,
        Analytics.date.in_(dates),
    ).all()

    total = sum(r.total_timeboxes for r in records)
    completed = sum(r.completed_count for r in records)
    skipped = sum(r.skipped_count for r in records)
    total_planned = sum(r.total_planned_minutes for r in records)
    total_actual = sum(r.total_actual_minutes for r in records)
    avg_accuracy = (sum(r.accuracy_percentage for r in records) / len(records)) if records else 0.0

    return {
        'month': month,
        'year': year,
        'total_timeboxes': total,
        'completed_count': completed,
        'skipped_count': skipped,
        'average_accuracy': round(avg_accuracy, 2),
        'total_planned_minutes': total_planned,
        'total_actual_minutes': total_actual,
        'daily_breakdown': [r.to_dict() for r in records],
    }


def get_patterns(user_id: str) -> dict:
    """Return time pattern analysis (by hour of day and day of week)."""
    timeboxes = Timebox.query.filter(
        Timebox.user_id == user_id,
        Timebox.status == 'completed',
    ).all()

    hour_counts: dict = {}
    dow_counts: dict = {}

    for t in timeboxes:
        if t.start_time:
            hour = t.start_time.hour
            dow = t.start_time.strftime('%A')
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
            dow_counts[dow] = dow_counts.get(dow, 0) + 1

    return {
        'by_hour': hour_counts,
        'by_day_of_week': dow_counts,
        'most_productive_hour': max(hour_counts, key=hour_counts.get) if hour_counts else None,
        'most_productive_day': max(dow_counts, key=dow_counts.get) if dow_counts else None,
    }


def get_streaks(user_id: str) -> dict:
    """Calculate current and longest streaks of days with at least one completed timebox."""
    records = (
        Analytics.query.filter(Analytics.user_id == user_id, Analytics.completed_count > 0)
        .order_by(Analytics.date)
        .all()
    )

    if not records:
        return {'current_streak': 0, 'longest_streak': 0, 'last_active_date': None}

    dates = sorted(r.date for r in records)
    longest = current = 1
    prev = dates[0]

    for d in dates[1:]:
        if (d - prev).days == 1:
            current += 1
            longest = max(longest, current)
        elif (d - prev).days > 1:
            current = 1
        prev = d

    today = date.today()
    last_date = dates[-1]
    if (today - last_date).days > 1:
        current = 0

    return {
        'current_streak': current,
        'longest_streak': longest,
        'last_active_date': last_date.isoformat(),
    }
