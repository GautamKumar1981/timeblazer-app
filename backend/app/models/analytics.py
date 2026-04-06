from datetime import date, datetime, timezone

from app import db


class Analytics(db.Model):
    __tablename__ = "analytics"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    total_timeboxes = db.Column(db.Integer, nullable=False, default=0)
    completed_count = db.Column(db.Integer, nullable=False, default=0)
    accuracy_percentage = db.Column(db.Float, nullable=False, default=0.0)
    total_productive_hours = db.Column(db.Float, nullable=False, default=0.0)
    interruptions_count = db.Column(db.Integer, nullable=False, default=0)
    streak_days = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (db.UniqueConstraint("user_id", "date", name="uq_user_date_analytics"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "total_timeboxes": self.total_timeboxes,
            "completed_count": self.completed_count,
            "accuracy_percentage": self.accuracy_percentage,
            "total_productive_hours": self.total_productive_hours,
            "interruptions_count": self.interruptions_count,
            "streak_days": self.streak_days,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Analytics {self.date} user={self.user_id}>"
