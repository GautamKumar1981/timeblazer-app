from datetime import datetime, timezone, date as date_type
from app import db


class AnalyticsRecord(db.Model):
    __tablename__ = 'analytics'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date_type.today)
    total_timeboxes = db.Column(db.Integer, default=0)
    completed_timeboxes = db.Column(db.Integer, default=0)
    total_focus_minutes = db.Column(db.Integer, default=0)
    productivity_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_analytics_user_date'),)

    def completion_rate(self) -> float:
        if self.total_timeboxes == 0:
            return 0.0
        return round(self.completed_timeboxes / self.total_timeboxes * 100, 2)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'total_timeboxes': self.total_timeboxes,
            'completed_timeboxes': self.completed_timeboxes,
            'total_focus_minutes': self.total_focus_minutes,
            'productivity_score': self.productivity_score,
            'completion_rate': self.completion_rate(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<AnalyticsRecord {self.date}>'
