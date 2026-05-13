from app import db


class BaziProfile(db.Model):
    __tablename__ = 'bazi_profiles'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    birth_date       = db.Column(db.Date, nullable=False)
    birth_hour       = db.Column(db.Integer, nullable=False)   # 0-23
    birth_minute     = db.Column(db.Integer, default=0)
    gender           = db.Column(db.String(1), nullable=False)  # 'M' or 'F'
    timezone_offset  = db.Column(db.Float, default=0.0)         # hours from UTC
    # Location
    birth_country    = db.Column(db.String(100), default='')
    birth_city       = db.Column(db.String(100), default='')
    birth_lat        = db.Column(db.Float, nullable=True)
    birth_lon        = db.Column(db.Float, nullable=True)
    # Vedic computed fields (populated when lat/lon are available)
    moon_rashi       = db.Column(db.String(50), default='')
    moon_nakshatra   = db.Column(db.String(100), default='')
    moon_longitude   = db.Column(db.Float, nullable=True)
    created_at       = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at       = db.Column(db.DateTime, default=db.func.current_timestamp(),
                                 onupdate=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('bazi_profile', uselist=False, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id':               self.id,
            'user_id':          self.user_id,
            'birth_date':       self.birth_date.isoformat(),
            'birth_hour':       self.birth_hour,
            'birth_minute':     self.birth_minute,
            'gender':           self.gender,
            'timezone_offset':  self.timezone_offset,
            'birth_country':    self.birth_country or '',
            'birth_city':       self.birth_city or '',
            'birth_lat':        self.birth_lat,
            'birth_lon':        self.birth_lon,
            'moon_rashi':       self.moon_rashi or '',
            'moon_nakshatra':   self.moon_nakshatra or '',
            'moon_longitude':   self.moon_longitude,
        }
