from datetime import datetime, timezone
from app import db


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    week_start = db.Column(db.Date, nullable=False)
    week_end = db.Column(db.Date, nullable=False)
    accomplishments = db.Column(db.Text, default='')
    challenges = db.Column(db.Text, default='')
    goals_next_week = db.Column(db.Text, default='')
    overall_rating = db.Column(db.Integer, nullable=True)  # 1-5
    auto_generated = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'week_start': self.week_start.isoformat() if self.week_start else None,
            'week_end': self.week_end.isoformat() if self.week_end else None,
            'accomplishments': self.accomplishments,
            'challenges': self.challenges,
            'goals_next_week': self.goals_next_week,
            'overall_rating': self.overall_rating,
            'auto_generated': self.auto_generated,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Review week={self.week_start}>'
