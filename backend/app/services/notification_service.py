from datetime import datetime, timezone

from app import db
from app.models.user import User
from app.models.timebox import Timebox
from app.websocket.events import (
    TIMEBOX_UPDATED,
    GOAL_CREATED,
    PRIORITY_CHANGED,
    TIMER_TICK,
)


class NotificationService:
    @staticmethod
    def send_timebox_reminder(user_id: int, timebox_id: int) -> bool:
        """Emit a WebSocket reminder 5 minutes before a timebox starts."""
        try:
            from app import socketio
            from app.websocket.handlers import emit_to_user

            timebox = db.session.get(Timebox, timebox_id)
            if not timebox or timebox.user_id != user_id:
                return False

            emit_to_user(
                user_id,
                TIMEBOX_UPDATED,
                {
                    "type": "reminder",
                    "timebox_id": timebox_id,
                    "title": timebox.title,
                    "start_time": timebox.start_time.isoformat(),
                    "message": f"'{timebox.title}' starts in 5 minutes",
                },
            )
            return True
        except Exception:
            return False

    @staticmethod
    def send_completion_alert(user_id: int, timebox_id: int) -> bool:
        """Emit a WebSocket alert when a timebox is completed."""
        try:
            from app.websocket.handlers import emit_to_user

            timebox = db.session.get(Timebox, timebox_id)
            if not timebox or timebox.user_id != user_id:
                return False

            emit_to_user(
                user_id,
                TIMEBOX_UPDATED,
                {
                    "type": "completed",
                    "timebox_id": timebox_id,
                    "title": timebox.title,
                    "message": f"'{timebox.title}' marked as completed",
                },
            )
            return True
        except Exception:
            return False

    @staticmethod
    def send_daily_reminder(user_id: int) -> bool:
        """Emit a WebSocket reminder at 8 AM for daily priorities."""
        try:
            from app.websocket.handlers import emit_to_user

            emit_to_user(
                user_id,
                PRIORITY_CHANGED,
                {
                    "type": "daily_reminder",
                    "message": "Good morning! Don't forget to set your top 3 priorities for today.",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )
            return True
        except Exception:
            return False

    @staticmethod
    def send_weekly_review_reminder(user_id: int) -> bool:
        """Emit a WebSocket reminder on Monday 9 AM for weekly review."""
        try:
            from app.websocket.handlers import emit_to_user

            emit_to_user(
                user_id,
                GOAL_CREATED,
                {
                    "type": "weekly_review_reminder",
                    "message": "It's Monday — time to review last week and plan ahead!",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )
            return True
        except Exception:
            return False
