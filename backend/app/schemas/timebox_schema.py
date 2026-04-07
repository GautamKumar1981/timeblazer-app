from marshmallow import Schema, fields, validate, validates, ValidationError


class TimeboxCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime(required=True)
    end_time = fields.DateTime(required=True)
    category = fields.Str(allow_none=True, validate=validate.Length(max=100))
    color = fields.Str(load_default='#4A90E2', validate=validate.Length(max=20))
    notes = fields.Str(allow_none=True)

    @validates('end_time')
    def validate_end_time(self, value, **kwargs):
        pass  # Cross-field validation handled in service


class TimeboxUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime()
    end_time = fields.DateTime()
    category = fields.Str(allow_none=True)
    color = fields.Str(validate=validate.Length(max=20))
    status = fields.Str(validate=validate.OneOf(['scheduled', 'active', 'completed', 'skipped']))
    actual_start = fields.DateTime(allow_none=True)
    actual_end = fields.DateTime(allow_none=True)
    actual_duration = fields.Int(allow_none=True)
    notes = fields.Str(allow_none=True)


class TimeboxStatusSchema(Schema):
    status = fields.Str(required=True, validate=validate.OneOf(['scheduled', 'active', 'completed', 'skipped']))
    actual_start = fields.DateTime(allow_none=True)
    actual_end = fields.DateTime(allow_none=True)
    actual_duration = fields.Int(allow_none=True)
    notes = fields.Str(allow_none=True)
