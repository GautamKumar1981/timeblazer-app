import uuid
from datetime import datetime, timezone
from app import db


class DailyPriority(db.Model):
    __tablename__ = 'daily_priorities'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    priority_1 = db.Column(db.String(255), nullable=True)
    priority_2 = db.Column(db.String(255), nullable=True)
    priority_3 = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_daily_priority_user_date'),)

    user = db.relationship('User', back_populates='daily_priorities')

    def __repr__(self) -> str:
        return f'<DailyPriority {self.date}>'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'priority_1': self.priority_1,
            'priority_2': self.priority_2,
            'priority_3': self.priority_3,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
