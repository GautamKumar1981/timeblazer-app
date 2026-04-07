from datetime import date, datetime, timezone
from typing import List, Optional

from app import db
from app.models.timebox import Timebox


def create_timebox(user_id: str, data: dict) -> Timebox:
    """Create a new timebox for the given user."""
    timebox = Timebox(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        start_time=data['start_time'],
        end_time=data['end_time'],
        category=data.get('category'),
        color=data.get('color', '#4A90E2'),
        notes=data.get('notes'),
    )
    db.session.add(timebox)
    db.session.commit()
    return timebox


def update_timebox(timebox_id: str, data: dict) -> Optional[Timebox]:
    """Update an existing timebox."""
    timebox = db.session.get(Timebox, timebox_id)
    if not timebox:
        return None
    for field in ('title', 'description', 'start_time', 'end_time', 'category',
                  'color', 'status', 'actual_start', 'actual_end', 'actual_duration', 'notes'):
        if field in data:
            setattr(timebox, field, data[field])
    timebox.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return timebox


def calculate_accuracy(timebox: Timebox) -> float:
    """Calculate accuracy percentage of a completed timebox.

    Returns the ratio of actual_duration to planned_duration as a float between 0 and 1.
    """
    planned = timebox.planned_duration
    if not planned or not timebox.actual_duration:
        return 0.0
    ratio = timebox.actual_duration / planned
    return min(ratio, 1.0)


def get_timeboxes_for_date(user_id: str, target_date: date) -> List[Timebox]:
    """Return all timeboxes for a user on a given date."""
    start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
    end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=timezone.utc)
    return Timebox.query.filter(
        Timebox.user_id == user_id,
        Timebox.start_time >= start,
        Timebox.start_time <= end,
    ).order_by(Timebox.start_time).all()
