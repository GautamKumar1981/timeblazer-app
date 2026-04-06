import enum
from datetime import date, datetime, timezone

from app import db


class GoalPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_date = db.Column(db.Date, nullable=True)
    priority = db.Column(
        db.Enum(GoalPriority, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=GoalPriority.MEDIUM,
    )
    status = db.Column(
        db.Enum(GoalStatus, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=GoalStatus.ACTIVE,
    )
    milestones = db.Column(db.JSON, nullable=True, default=list)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @property
    def days_remaining(self) -> int | None:
        if self.target_date is None:
            return None
        today = date.today()
        delta = self.target_date - today
        return delta.days

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "target_date": self.target_date.isoformat() if self.target_date else None,
            "priority": self.priority.value if isinstance(self.priority, GoalPriority) else self.priority,
            "status": self.status.value if isinstance(self.status, GoalStatus) else self.status,
            "milestones": self.milestones or [],
            "days_remaining": self.days_remaining,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<Goal {self.title}>"
