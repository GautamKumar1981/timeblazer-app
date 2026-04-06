from datetime import date, timedelta
from typing import Optional
from collections import defaultdict
from calendar import monthrange

from sqlalchemy import func

from app import db
from app.models.timebox import Timebox, TimeboxStatus, TimeboxCategory
from app.models.analytics import Analytics
from app.utils.helpers import get_week_start


class AnalyticsService:
    @staticmethod
    def calculate_accuracy(estimated: Optional[int], actual: Optional[int]) -> float:
        """Return accuracy percentage (0-100). 100% means perfectly on time."""
        if not estimated or not actual or estimated <= 0:
            return 0.0
        ratio = actual / estimated
        # Within 20% tolerance = full accuracy; scale down otherwise
        if ratio <= 1.2:
            return round(min(100.0, (1 - abs(1 - ratio)) * 100), 2)
        return round(max(0.0, 100.0 - (ratio - 1.2) * 50), 2)

    @staticmethod
    def calculate_completion_rate(user_id: int, target_date: date) -> float:
        """Calculate completion percentage for a single day."""
        total = Timebox.query.filter_by(user_id=user_id).filter(
            func.date(Timebox.start_time) == target_date
        ).count()
        if total == 0:
            return 0.0
        completed = Timebox.query.filter_by(user_id=user_id, status=TimeboxStatus.COMPLETED).filter(
            func.date(Timebox.start_time) == target_date
        ).count()
        return round((completed / total) * 100, 2)

    @staticmethod
    def get_weekly_stats(user_id: int, week_start: Optional[date] = None) -> dict:
        if week_start is None:
            week_start = get_week_start(date.today())
        week_end = week_start + timedelta(days=6)

        timeboxes = (
            Timebox.query.filter_by(user_id=user_id)
            .filter(func.date(Timebox.start_time) >= week_start)
            .filter(func.date(Timebox.start_time) <= week_end)
            .all()
        )

        total = len(timeboxes)
        completed = [t for t in timeboxes if t.status == TimeboxStatus.COMPLETED]
        completion_rate = round((len(completed) / total * 100), 2) if total else 0.0

        accuracy_values = [
            AnalyticsService.calculate_accuracy(t.estimated_duration, t.actual_duration)
            for t in completed
            if t.estimated_duration and t.actual_duration
        ]
        avg_accuracy = round(sum(accuracy_values) / len(accuracy_values), 2) if accuracy_values else 0.0

        total_minutes = sum(
            (t.actual_duration or 0) for t in completed if t.category != TimeboxCategory.BREAKS
        )
        total_productive_hours = round(total_minutes / 60, 2)

        # Daily breakdown
        daily: dict = defaultdict(lambda: {"total": 0, "completed": 0, "productive_minutes": 0})
        for t in timeboxes:
            day_key = t.start_time.date().isoformat()
            daily[day_key]["total"] += 1
            if t.status == TimeboxStatus.COMPLETED:
                daily[day_key]["completed"] += 1
                if t.category != TimeboxCategory.BREAKS:
                    daily[day_key]["productive_minutes"] += t.actual_duration or 0

        daily_breakdown = [
            {
                "date": d,
                "total": v["total"],
                "completed": v["completed"],
                "completion_rate": round(v["completed"] / v["total"] * 100, 2) if v["total"] else 0.0,
                "productive_hours": round(v["productive_minutes"] / 60, 2),
            }
            for d, v in sorted(daily.items())
        ]

        # Category breakdown
        category_counts: dict = defaultdict(int)
        for t in timeboxes:
            cat = t.category.value if hasattr(t.category, "value") else t.category
            category_counts[cat] += 1
        category_breakdown = dict(category_counts)

        streak_info = AnalyticsService.get_streaks(user_id)

        return {
            "week_start": week_start,
            "week_end": week_end,
            "total_timeboxes": total,
            "completed_count": len(completed),
            "completion_rate": completion_rate,
            "avg_accuracy": avg_accuracy,
            "total_productive_hours": total_productive_hours,
            "daily_breakdown": daily_breakdown,
            "category_breakdown": category_breakdown,
            "streak_days": streak_info["current_streak"],
        }

    @staticmethod
    def get_monthly_stats(user_id: int, month: int, year: int) -> dict:
        _, last_day = monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, last_day)

        timeboxes = (
            Timebox.query.filter_by(user_id=user_id)
            .filter(func.date(Timebox.start_time) >= month_start)
            .filter(func.date(Timebox.start_time) <= month_end)
            .all()
        )

        total = len(timeboxes)
        completed = [t for t in timeboxes if t.status == TimeboxStatus.COMPLETED]
        completion_rate = round((len(completed) / total * 100), 2) if total else 0.0

        accuracy_values = [
            AnalyticsService.calculate_accuracy(t.estimated_duration, t.actual_duration)
            for t in completed
            if t.estimated_duration and t.actual_duration
        ]
        avg_accuracy = round(sum(accuracy_values) / len(accuracy_values), 2) if accuracy_values else 0.0

        total_minutes = sum(
            (t.actual_duration or 0) for t in completed if t.category != TimeboxCategory.BREAKS
        )
        total_productive_hours = round(total_minutes / 60, 2)

        # Weekly breakdown within the month
        weekly: dict = defaultdict(lambda: {"total": 0, "completed": 0})
        for t in timeboxes:
            week_num = t.start_time.isocalendar()[1]
            weekly[week_num]["total"] += 1
            if t.status == TimeboxStatus.COMPLETED:
                weekly[week_num]["completed"] += 1

        weekly_breakdown = [
            {
                "week": w,
                "total": v["total"],
                "completed": v["completed"],
                "completion_rate": round(v["completed"] / v["total"] * 100, 2) if v["total"] else 0.0,
            }
            for w, v in sorted(weekly.items())
        ]

        # Best day of month
        daily_counts: dict = defaultdict(int)
        for t in timeboxes:
            if t.status == TimeboxStatus.COMPLETED:
                daily_counts[t.start_time.strftime("%A")] += 1
        best_day = max(daily_counts, key=daily_counts.get) if daily_counts else None

        return {
            "month": month,
            "year": year,
            "total_timeboxes": total,
            "completed_count": len(completed),
            "completion_rate": completion_rate,
            "avg_accuracy": avg_accuracy,
            "total_productive_hours": total_productive_hours,
            "weekly_breakdown": weekly_breakdown,
            "best_day": best_day,
        }

    @staticmethod
    def get_patterns(user_id: int) -> dict:
        timeboxes = Timebox.query.filter_by(user_id=user_id).all()

        day_counts: dict = defaultdict(int)
        hour_counts: dict = defaultdict(int)
        category_counts: dict = defaultdict(int)

        for t in timeboxes:
            day_counts[t.start_time.strftime("%A")] += 1
            hour_counts[t.start_time.hour] += 1
            cat = t.category.value if hasattr(t.category, "value") else t.category
            category_counts[cat] += 1

        total = len(timeboxes)

        busiest_days = sorted(
            [{"day": d, "count": c} for d, c in day_counts.items()],
            key=lambda x: x["count"],
            reverse=True,
        )
        busiest_hours = sorted(
            [{"hour": h, "count": c, "label": f"{h:02d}:00"} for h, c in hour_counts.items()],
            key=lambda x: x["count"],
            reverse=True,
        )[:10]
        most_used_categories = sorted(
            [{"category": cat, "count": c} for cat, c in category_counts.items()],
            key=lambda x: x["count"],
            reverse=True,
        )

        unique_days = len({t.start_time.date() for t in timeboxes})
        avg_daily = round(total / unique_days, 2) if unique_days else 0.0

        return {
            "busiest_days": busiest_days,
            "busiest_hours": busiest_hours,
            "most_used_categories": most_used_categories,
            "avg_daily_timeboxes": avg_daily,
        }

    @staticmethod
    def get_streaks(user_id: int) -> dict:
        """Calculate current and longest streaks (days with >75% completion)."""
        rows = (
            db.session.query(func.date(Timebox.start_time).label("day"))
            .filter(Timebox.user_id == user_id)
            .group_by(func.date(Timebox.start_time))
            .order_by(func.date(Timebox.start_time).asc())
            .all()
        )

        qualifying_days = set()
        for row in rows:
            # func.date() returns str on SQLite, date on PostgreSQL — normalise both
            day = row.day if isinstance(row.day, date) else date.fromisoformat(str(row.day))
            rate = AnalyticsService.calculate_completion_rate(user_id, day)
            if rate >= 75.0:
                qualifying_days.add(day)

        if not qualifying_days:
            return {"current_streak": 0, "longest_streak": 0, "last_active_date": None}

        sorted_days = sorted(qualifying_days)
        longest = 1
        current = 1
        streak = 1

        for i in range(1, len(sorted_days)):
            if (sorted_days[i] - sorted_days[i - 1]).days == 1:
                streak += 1
                longest = max(longest, streak)
            else:
                streak = 1

        # Determine if current streak is still active
        today = date.today()
        last_day = sorted_days[-1]
        gap = (today - last_day).days
        if gap <= 1:
            # Walk backwards from last_day to measure current streak
            current = 1
            for i in range(len(sorted_days) - 2, -1, -1):
                if (sorted_days[i + 1] - sorted_days[i]).days == 1:
                    current += 1
                else:
                    break
        else:
            current = 0

        return {
            "current_streak": current,
            "longest_streak": longest,
            "last_active_date": last_day,
        }
