from datetime import datetime, timezone

from app import db


class WeeklyReview(db.Model):
    __tablename__ = "weekly_reviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_start_date = db.Column(db.Date, nullable=False)
    week_end_date = db.Column(db.Date, nullable=False)
    completion_rate = db.Column(db.Float, nullable=False, default=0.0)
    key_insights = db.Column(db.JSON, nullable=True, default=list)
    wins = db.Column(db.JSON, nullable=True, default=list)
    improvements = db.Column(db.JSON, nullable=True, default=list)
    next_week_focus = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "week_start_date", name="uq_user_week_review"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "week_start_date": self.week_start_date.isoformat() if self.week_start_date else None,
            "week_end_date": self.week_end_date.isoformat() if self.week_end_date else None,
            "completion_rate": self.completion_rate,
            "key_insights": self.key_insights or [],
            "wins": self.wins or [],
            "improvements": self.improvements or [],
            "next_week_focus": self.next_week_focus,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<WeeklyReview {self.week_start_date} user={self.user_id}>"
