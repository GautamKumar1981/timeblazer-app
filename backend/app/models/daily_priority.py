from datetime import date, datetime, timezone

from app import db


class DailyPriority(db.Model):
    __tablename__ = "daily_priorities"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    priority_1 = db.Column(db.String(255), nullable=True)
    priority_2 = db.Column(db.String(255), nullable=True)
    priority_3 = db.Column(db.String(255), nullable=True)
    # Bitmask: bit 0 = priority_1 done, bit 1 = priority_2, bit 2 = priority_3
    completion_status = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (db.UniqueConstraint("user_id", "date", name="uq_user_date_priority"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "priority_1": self.priority_1,
            "priority_2": self.priority_2,
            "priority_3": self.priority_3,
            "completion_status": self.completion_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<DailyPriority {self.date} user={self.user_id}>"
