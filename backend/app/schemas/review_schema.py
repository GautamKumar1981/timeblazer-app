from marshmallow import Schema, fields, validate


class WeeklyReviewCreateSchema(Schema):
    week_start_date = fields.Date(load_default=None)
    next_week_focus = fields.String(allow_none=True, load_default=None)
    wins = fields.List(fields.String(), load_default=list)
    improvements = fields.List(fields.String(), load_default=list)
    key_insights = fields.List(fields.String(), load_default=list)


class WeeklyReviewSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    week_start_date = fields.Date()
    week_end_date = fields.Date()
    completion_rate = fields.Float()
    key_insights = fields.List(fields.String())
    wins = fields.List(fields.String())
    improvements = fields.List(fields.String())
    next_week_focus = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
