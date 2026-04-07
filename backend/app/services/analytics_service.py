from datetime import date, timedelta
from app import db
from app.models.timebox import Timebox
from app.models.analytics import AnalyticsRecord
from app.models.goal import Goal
from app.models.daily_priority import DailyPriority


class AnalyticsService:

    @staticmethod
    def _compute_productivity_score(total: int, completed: int, focus_minutes: int) -> float:
        if total == 0:
            return 0.0
        completion_rate = completed / total
        focus_score = min(focus_minutes / 480, 1.0)  # 8h max
        return round((completion_rate * 0.7 + focus_score * 0.3) * 100, 2)

    @staticmethod
    def get_or_create_record(user_id: int, record_date: date) -> AnalyticsRecord:
        record = AnalyticsRecord.query.filter_by(user_id=user_id, date=record_date).first()
        if not record:
            record = AnalyticsRecord(user_id=user_id, date=record_date)
            db.session.add(record)

        timeboxes = Timebox.query.filter(
            Timebox.user_id == user_id,
            db.func.date(Timebox.start_time) == record_date
        ).all()

        record.total_timeboxes = len(timeboxes)
        record.completed_timeboxes = sum(1 for t in timeboxes if t.completed)
        record.total_focus_minutes = sum(t.duration_minutes() for t in timeboxes if t.completed)
        record.productivity_score = AnalyticsService._compute_productivity_score(
            record.total_timeboxes, record.completed_timeboxes, record.total_focus_minutes
        )
        db.session.commit()
        return record

    @staticmethod
    def get_summary(user_id: int):
        today = date.today()
        record = AnalyticsService.get_or_create_record(user_id, today)

        active_goals = Goal.query.filter_by(user_id=user_id, status='active').count()
        completed_goals = Goal.query.filter_by(user_id=user_id, status='completed').count()

        priorities_today = DailyPriority.query.filter_by(user_id=user_id, date=today).all()
        priorities_completed = sum(1 for p in priorities_today if p.completed)

        week_start = today - timedelta(days=today.weekday())
        weekly_records = AnalyticsRecord.query.filter(
            AnalyticsRecord.user_id == user_id,
            AnalyticsRecord.date >= week_start,
            AnalyticsRecord.date <= today,
        ).all()

        weekly_focus = sum(r.total_focus_minutes for r in weekly_records)
        avg_productivity = (
            sum(r.productivity_score for r in weekly_records) / len(weekly_records)
            if weekly_records else 0.0
        )

        return {
            'today': record.to_dict(),
            'active_goals': active_goals,
            'completed_goals': completed_goals,
            'priorities_today': len(priorities_today),
            'priorities_completed': priorities_completed,
            'weekly_focus_minutes': weekly_focus,
            'avg_weekly_productivity': round(avg_productivity, 2),
        }, 200

    @staticmethod
    def get_productivity(user_id: int, days: int = 30):
        today = date.today()
        start = today - timedelta(days=days - 1)

        records = AnalyticsRecord.query.filter(
            AnalyticsRecord.user_id == user_id,
            AnalyticsRecord.date >= start,
            AnalyticsRecord.date <= today,
        ).order_by(AnalyticsRecord.date).all()

        record_map = {r.date: r for r in records}
        data = []
        for i in range(days):
            d = start + timedelta(days=i)
            if d in record_map:
                data.append(record_map[d].to_dict())
            else:
                data.append({
                    'date': d.isoformat(),
                    'total_timeboxes': 0,
                    'completed_timeboxes': 0,
                    'total_focus_minutes': 0,
                    'productivity_score': 0.0,
                    'completion_rate': 0.0,
                })

        return {'productivity': data, 'days': days}, 200

    @staticmethod
    def get_weekly(user_id: int, weeks: int = 8):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        data = []

        for w in range(weeks - 1, -1, -1):
            ws = week_start - timedelta(weeks=w)
            we = ws + timedelta(days=6)

            records = AnalyticsRecord.query.filter(
                AnalyticsRecord.user_id == user_id,
                AnalyticsRecord.date >= ws,
                AnalyticsRecord.date <= we,
            ).all()

            total_focus = sum(r.total_focus_minutes for r in records)
            total_boxes = sum(r.total_timeboxes for r in records)
            completed_boxes = sum(r.completed_timeboxes for r in records)
            avg_score = (
                sum(r.productivity_score for r in records) / len(records)
                if records else 0.0
            )

            data.append({
                'week_start': ws.isoformat(),
                'week_end': we.isoformat(),
                'total_focus_minutes': total_focus,
                'total_timeboxes': total_boxes,
                'completed_timeboxes': completed_boxes,
                'avg_productivity_score': round(avg_score, 2),
            })

        return {'weekly': data, 'weeks': weeks}, 200
