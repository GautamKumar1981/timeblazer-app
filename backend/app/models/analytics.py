import uuid
from datetime import datetime, timezone
from app import db


class Analytics(db.Model):
    __tablename__ = 'analytics'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    total_timeboxes = db.Column(db.Integer, nullable=False, default=0)
    completed_count = db.Column(db.Integer, nullable=False, default=0)
    skipped_count = db.Column(db.Integer, nullable=False, default=0)
    accuracy_percentage = db.Column(db.Float, nullable=False, default=0.0)
    total_planned_minutes = db.Column(db.Integer, nullable=False, default=0)
    total_actual_minutes = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_analytics_user_date'),)

    user = db.relationship('User', back_populates='analytics')

    def __repr__(self) -> str:
        return f'<Analytics {self.date}>'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'total_timeboxes': self.total_timeboxes,
            'completed_count': self.completed_count,
            'skipped_count': self.skipped_count,
            'accuracy_percentage': self.accuracy_percentage,
            'total_planned_minutes': self.total_planned_minutes,
            'total_actual_minutes': self.total_actual_minutes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
