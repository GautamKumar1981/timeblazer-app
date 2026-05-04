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
    created_at       = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at       = db.Column(db.DateTime, default=db.func.current_timestamp(),
                                 onupdate=db.func.current_timestamp())

    user = db.relationship('User', backref=db.backref('bazi_profile', uselist=False))

    def to_dict(self):
        return {
            'id':               self.id,
            'user_id':          self.user_id,
            'birth_date':       self.birth_date.isoformat(),
            'birth_hour':       self.birth_hour,
            'birth_minute':     self.birth_minute,
            'gender':           self.gender,
            'timezone_offset':  self.timezone_offset,
        }
