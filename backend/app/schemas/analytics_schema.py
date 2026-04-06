from marshmallow import Schema, fields


class AnalyticsDailySchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    date = fields.Date()
    total_timeboxes = fields.Integer()
    completed_count = fields.Integer()
    accuracy_percentage = fields.Float()
    total_productive_hours = fields.Float()
    interruptions_count = fields.Integer()
    streak_days = fields.Integer()
    created_at = fields.DateTime(dump_only=True)


class WeeklyStatsSchema(Schema):
    week_start = fields.Date()
    week_end = fields.Date()
    total_timeboxes = fields.Integer()
    completed_count = fields.Integer()
    completion_rate = fields.Float()
    avg_accuracy = fields.Float()
    total_productive_hours = fields.Float()
    daily_breakdown = fields.List(fields.Dict())
    category_breakdown = fields.Dict()
    streak_days = fields.Integer()


class MonthlyStatsSchema(Schema):
    month = fields.Integer()
    year = fields.Integer()
    total_timeboxes = fields.Integer()
    completed_count = fields.Integer()
    completion_rate = fields.Float()
    avg_accuracy = fields.Float()
    total_productive_hours = fields.Float()
    weekly_breakdown = fields.List(fields.Dict())
    best_day = fields.String(allow_none=True)


class PatternsSchema(Schema):
    busiest_days = fields.List(fields.Dict())
    busiest_hours = fields.List(fields.Dict())
    most_used_categories = fields.List(fields.Dict())
    avg_daily_timeboxes = fields.Float()


class StreakSchema(Schema):
    current_streak = fields.Integer()
    longest_streak = fields.Integer()
    last_active_date = fields.Date(allow_none=True)
