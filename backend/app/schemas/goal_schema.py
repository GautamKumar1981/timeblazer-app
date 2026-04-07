from marshmallow import Schema, fields, validate


class GoalCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    target_date = fields.Date(allow_none=True)
    priority = fields.Str(load_default='medium', validate=validate.OneOf(['low', 'medium', 'high']))
    milestones = fields.List(fields.Dict(), load_default=list)


class GoalUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    target_date = fields.Date(allow_none=True)
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']))
    status = fields.Str(validate=validate.OneOf(['active', 'completed', 'paused']))
    progress = fields.Int(validate=validate.Range(min=0, max=100))
    milestones = fields.List(fields.Dict())


class GoalProgressSchema(Schema):
    progress = fields.Int(required=True, validate=validate.Range(min=0, max=100))
