from datetime import datetime, timezone
from app import db


class VedicProfile(db.Model):
    __tablename__ = 'vedic_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    user    = db.relationship('User', backref=db.backref('vedic_profile', uselist=False, cascade='all, delete-orphan'))

    # Birth data for Kundali/Jyotish
    birth_date = db.Column(db.Date, nullable=False)
    birth_hour = db.Column(db.Integer, default=6)        # 0-23
    birth_minute = db.Column(db.Integer, default=0)      # 0-59
    birth_city = db.Column(db.String(100), default='Kathmandu')
    birth_lat = db.Column(db.Float, default=27.7172)     # latitude
    birth_lon = db.Column(db.Float, default=85.3240)     # longitude
    gender = db.Column(db.String(1), default='M')        # M or F

    # Rashi (Moon sign) — computed and cached
    moon_rashi = db.Column(db.String(50), default='')
    moon_nakshatra = db.Column(db.String(100), default='')
    moon_longitude = db.Column(db.Float, default=0.0)    # sidereal Moon lon at birth

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
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'birth_hour': self.birth_hour,
            'birth_minute': self.birth_minute,
            'birth_city': self.birth_city,
            'birth_lat': self.birth_lat,
            'birth_lon': self.birth_lon,
            'gender': self.gender,
            'moon_rashi': self.moon_rashi,
            'moon_nakshatra': self.moon_nakshatra,
            'moon_longitude': self.moon_longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
