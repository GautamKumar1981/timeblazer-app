import uuid
from datetime import datetime, timezone
from app import db


class WeeklyReview(db.Model):
    __tablename__ = 'weekly_reviews'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    week_start_date = db.Column(db.Date, nullable=False, index=True)
    completion_rate = db.Column(db.Float, nullable=False, default=0.0)
    wins = db.Column(db.JSON, nullable=True, default=list)
    improvements = db.Column(db.JSON, nullable=True, default=list)
    insights = db.Column(db.Text, nullable=True)
    mood = db.Column(db.Integer, nullable=True)  # 1-5
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'week_start_date', name='uq_weekly_review_user_week'),)

    user = db.relationship('User', back_populates='weekly_reviews')

    def __repr__(self) -> str:
        return f'<WeeklyReview {self.week_start_date}>'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'week_start_date': self.week_start_date.isoformat() if self.week_start_date else None,
            'completion_rate': self.completion_rate,
            'wins': self.wins or [],
            'improvements': self.improvements or [],
            'insights': self.insights,
            'mood': self.mood,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
