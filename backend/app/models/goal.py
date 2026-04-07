import uuid
from datetime import datetime, timezone
from app import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Goal(db.Model):
    __tablename__ = 'goals'

    PRIORITIES = ('low', 'medium', 'high')
    STATUSES = ('active', 'completed', 'paused')

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_date = db.Column(db.Date, nullable=True)
    priority = db.Column(db.String(20), nullable=False, default='medium')
    status = db.Column(db.String(20), nullable=False, default='active')
    progress = db.Column(db.Integer, nullable=False, default=0)  # 0-100
    milestones = db.Column(db.JSON, nullable=True, default=list)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    user = db.relationship('User', back_populates='goals')

    def __repr__(self) -> str:
        return f'<Goal {self.title}>'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'priority': self.priority,
            'status': self.status,
            'progress': self.progress,
            'milestones': self.milestones or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
