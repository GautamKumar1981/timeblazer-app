from datetime import datetime, timedelta
from app import db


class UserSubscription(db.Model):
    __tablename__ = 'user_subscriptions'

    id                     = db.Column(db.Integer, primary_key=True)
    user_id                = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    trial_start            = db.Column(db.DateTime, nullable=True)
    trial_end              = db.Column(db.DateTime, nullable=True)
    subscribed_until       = db.Column(db.DateTime, nullable=True)
    is_cancelled           = db.Column(db.Boolean, default=False)
    created_at             = db.Column(db.DateTime, default=datetime.utcnow)
    stripe_customer_id     = db.Column(db.String(255), nullable=True)
    stripe_subscription_id = db.Column(db.String(255), nullable=True)
    plan                   = db.Column(db.String(20), nullable=True)  # 'monthly' or 'annual'

    TRIAL_DAYS = 7

    def start_trial(self):
        now = datetime.utcnow()
        self.trial_start = now
        self.trial_end   = now + timedelta(days=self.TRIAL_DAYS)
        return self

    @property
    def is_trial_active(self):
        return bool(self.trial_end and datetime.utcnow() <= self.trial_end)

    @property
    def is_subscribed(self):
        return bool(self.subscribed_until and datetime.utcnow() <= self.subscribed_until)

    @property
    def has_premium_access(self):
        return self.is_trial_active or self.is_subscribed

    @property
    def trial_days_remaining(self):
        if not self.is_trial_active:
            return 0
        return max(0, (self.trial_end - datetime.utcnow()).days)

    def to_dict(self):
        return {
            'trial_start':         self.trial_start.isoformat() if self.trial_start else None,
            'trial_end':           self.trial_end.isoformat()   if self.trial_end   else None,
            'trial_days_remaining': self.trial_days_remaining,
            'is_trial_active':     self.is_trial_active,
            'subscribed_until':    self.subscribed_until.isoformat() if self.subscribed_until else None,
            'is_subscribed':       self.is_subscribed,
            'has_premium_access':  self.has_premium_access,
            'is_cancelled':        self.is_cancelled,
            'price_gbp':           2.99,
        }
