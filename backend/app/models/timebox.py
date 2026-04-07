import uuid
from datetime import datetime, timezone
from app import db


class Timebox(db.Model):
    __tablename__ = 'timeboxes'

    STATUSES = ('scheduled', 'active', 'completed', 'skipped')

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(20), nullable=False, default='#4A90E2')
    status = db.Column(db.String(20), nullable=False, default='scheduled')
    actual_start = db.Column(db.DateTime(timezone=True), nullable=True)
    actual_end = db.Column(db.DateTime(timezone=True), nullable=True)
    actual_duration = db.Column(db.Integer, nullable=True)  # minutes
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', back_populates='timeboxes')

    def __repr__(self) -> str:
        return f'<Timebox {self.title}>'

    @property
    def planned_duration(self) -> int:
        """Planned duration in minutes."""
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return 0

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'category': self.category,
            'color': self.color,
            'status': self.status,
            'actual_start': self.actual_start.isoformat() if self.actual_start else None,
            'actual_end': self.actual_end.isoformat() if self.actual_end else None,
            'actual_duration': self.actual_duration,
            'planned_duration': self.planned_duration,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
