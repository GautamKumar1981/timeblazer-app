from datetime import datetime, timezone

import bcrypt

from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    timezone = db.Column(db.String(64), nullable=False, default="UTC")
    profile_picture_url = db.Column(db.String(512), nullable=True)
    theme = db.Column(db.String(32), nullable=False, default="light")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    timeboxes = db.relationship("Timebox", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    goals = db.relationship("Goal", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    daily_priorities = db.relationship("DailyPriority", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    analytics = db.relationship("Analytics", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    reviews = db.relationship("WeeklyReview", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "timezone": self.timezone,
            "profile_picture_url": self.profile_picture_url,
            "theme": self.theme,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"
