from datetime import datetime, timezone
from app import db


class Timebox(db.Model):
    __tablename__ = 'timeboxes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    category = db.Column(db.String(100), default='general')
    color = db.Column(db.String(20), default='#3B82F6')
    completed = db.Column(db.Boolean, default=False, nullable=False)
    priority = db.Column(db.Integer, default=3)  # 1-5
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def duration_minutes(self) -> int:
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return 0

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'category': self.category,
            'color': self.color,
            'completed': self.completed,
            'priority': self.priority,
            'duration_minutes': self.duration_minutes(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Timebox {self.title}>'
