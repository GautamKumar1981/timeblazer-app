from app.models.user import User
from app.models.timebox import Timebox
from app.models.analytics import Analytics


def send_timebox_reminder(user: User, timebox: Timebox) -> None:
    """Send a reminder notification for an upcoming timebox.

    Placeholder — integrate with an external notification provider (email/push) as needed.
    """
    print(f"[NOTIFICATION] Reminder for user {user.email}: '{timebox.title}' starts soon.")


def send_daily_summary(user: User, analytics: Analytics) -> None:
    """Send a daily summary notification to the user.

    Placeholder — integrate with an external notification provider as needed.
    """
    print(
        f"[NOTIFICATION] Daily summary for {user.email} on {analytics.date}: "
        f"{analytics.completed_count}/{analytics.total_timeboxes} timeboxes completed."
    )
