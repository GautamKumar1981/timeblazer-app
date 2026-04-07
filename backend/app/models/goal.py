from datetime import datetime, timezone
from app import db


class Goal(db.Model):
    __tablename__ = 'goals'

    STATUSES = ('active', 'completed', 'archived')

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='')
    target_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False)
    progress = db.Column(db.Integer, default=0)  # 0-100
    category = db.Column(db.String(100), default='general')
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
            'title': self.title,
            'description': self.description,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'status': self.status,
            'progress': self.progress,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Goal {self.title}>'
