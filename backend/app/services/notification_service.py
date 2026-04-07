from datetime import date, timedelta
from app.models.timebox import Timebox
from app.models.goal import Goal
from app.models.daily_priority import DailyPriority
from app import db


class NotificationService:

    @staticmethod
    def get_upcoming_timeboxes(user_id: int, minutes_ahead: int = 15):
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        upcoming_cutoff = now + timedelta(minutes=minutes_ahead)

        timeboxes = Timebox.query.filter(
            Timebox.user_id == user_id,
            Timebox.start_time >= now,
            Timebox.start_time <= upcoming_cutoff,
            Timebox.completed == False,
        ).all()

        return [t.to_dict() for t in timeboxes]

    @staticmethod
    def get_overdue_goals(user_id: int):
        today = date.today()
        goals = Goal.query.filter(
            Goal.user_id == user_id,
            Goal.status == 'active',
            Goal.target_date < today,
        ).all()
        return [g.to_dict() for g in goals]

    @staticmethod
    def get_incomplete_priorities(user_id: int, for_date: date = None):
        if for_date is None:
            for_date = date.today()

        priorities = DailyPriority.query.filter_by(
            user_id=user_id,
            date=for_date,
            completed=False,
        ).order_by(DailyPriority.priority_order).all()

        return [p.to_dict() for p in priorities]

    @staticmethod
    def get_daily_summary(user_id: int):
        today = date.today()

        timeboxes_today = Timebox.query.filter(
            Timebox.user_id == user_id,
            db.func.date(Timebox.start_time) == today,
        ).all()

        priorities_today = DailyPriority.query.filter_by(user_id=user_id, date=today).all()
        overdue_goals = NotificationService.get_overdue_goals(user_id)

        return {
            'date': today.isoformat(),
            'total_timeboxes': len(timeboxes_today),
            'completed_timeboxes': sum(1 for t in timeboxes_today if t.completed),
            'total_priorities': len(priorities_today),
            'completed_priorities': sum(1 for p in priorities_today if p.completed),
            'overdue_goals_count': len(overdue_goals),
        }
