from datetime import date, datetime, timezone
from typing import Optional

from app import db
from app.models.goal import Goal


def create_goal(user_id: str, data: dict) -> Goal:
    """Create a new goal for the given user."""
    goal = Goal(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        target_date=data.get('target_date'),
        priority=data.get('priority', 'medium'),
        milestones=data.get('milestones', []),
    )
    db.session.add(goal)
    db.session.commit()
    return goal


def calculate_dday(goal: Goal) -> Optional[int]:
    """Return the number of days remaining until the goal's target date, or None."""
    if not goal.target_date:
        return None
    delta = goal.target_date - date.today()
    return delta.days


def update_progress(goal_id: str, progress: int) -> Optional[Goal]:
    """Update the progress of a goal. Auto-complete if progress reaches 100."""
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return None
    goal.progress = max(0, min(100, progress))
    if goal.progress == 100:
        goal.status = 'completed'
    goal.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return goal
