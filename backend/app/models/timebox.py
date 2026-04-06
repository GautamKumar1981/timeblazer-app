import enum
from datetime import datetime, timezone

from app import db


class TimeboxCategory(str, enum.Enum):
    WORK = "Work"
    MEETINGS = "Meetings"
    BREAKS = "Breaks"
    LEARNING = "Learning"
    PERSONAL = "Personal"


class TimeboxStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERRUN = "overrun"


class Timebox(db.Model):
    __tablename__ = "timeboxes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    category = db.Column(
        db.Enum(TimeboxCategory, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=TimeboxCategory.WORK,
    )
    color = db.Column(db.String(7), nullable=False, default="#4F46E5")
    status = db.Column(
        db.Enum(TimeboxStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=TimeboxStatus.NOT_STARTED,
    )
    estimated_duration = db.Column(db.Integer, nullable=True)
    actual_duration = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_recurring = db.Column(db.Boolean, nullable=False, default=False)
    recurrence_rule = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "category": self.category.value if isinstance(self.category, TimeboxCategory) else self.category,
            "color": self.color,
            "status": self.status.value if isinstance(self.status, TimeboxStatus) else self.status,
            "estimated_duration": self.estimated_duration,
            "actual_duration": self.actual_duration,
            "notes": self.notes,
            "is_recurring": self.is_recurring,
            "recurrence_rule": self.recurrence_rule,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<Timebox {self.title}>"
