import uuid
from datetime import datetime, timezone
from app import db


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    timezone = db.Column(db.String(50), nullable=False, default='UTC')
    theme = db.Column(db.String(20), nullable=False, default='light')
    notifications_enabled = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    timeboxes = db.relationship('Timebox', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    goals = db.relationship('Goal', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    daily_priorities = db.relationship('DailyPriority', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    analytics = db.relationship('Analytics', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    weekly_reviews = db.relationship('WeeklyReview', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')

    def __repr__(self) -> str:
        return f'<User {self.email}>'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'timezone': self.timezone,
            'theme': self.theme,
            'notifications_enabled': self.notifications_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
