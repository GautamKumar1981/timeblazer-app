from marshmallow import Schema, fields, validate, validates, ValidationError, validates_schema
from app.utils.helpers import validate_hex_color


class TimeboxCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255, error="Title must be between 1 and 255 characters"),
    )
    description = fields.String(allow_none=True, load_default=None)
    start_time = fields.DateTime(required=True)
    end_time = fields.DateTime(required=True)
    category = fields.String(
        load_default="Work",
        validate=validate.OneOf(
            ["Work", "Meetings", "Breaks", "Learning", "Personal"],
            error="Invalid category",
        ),
    )
    color = fields.String(load_default="#4F46E5")
    status = fields.String(
        load_default="not_started",
        validate=validate.OneOf(
            ["not_started", "in_progress", "completed", "overrun"],
            error="Invalid status",
        ),
    )
    estimated_duration = fields.Integer(allow_none=True, load_default=None, validate=validate.Range(min=1))
    actual_duration = fields.Integer(allow_none=True, load_default=None, validate=validate.Range(min=0))
    notes = fields.String(allow_none=True, load_default=None)
    is_recurring = fields.Boolean(load_default=False)
    recurrence_rule = fields.String(allow_none=True, load_default=None, validate=validate.Length(max=255))

    @validates("color")
    def validate_color(self, value):
        if value and not validate_hex_color(value):
            raise ValidationError("Color must be a valid hex color code (e.g. #4F46E5)")

    @validates_schema
    def validate_time_range(self, data, **kwargs):
        start = data.get("start_time")
        end = data.get("end_time")
        if start and end and end <= start:
            raise ValidationError("end_time must be after start_time")


class TimeboxUpdateSchema(Schema):
    title = fields.String(validate=validate.Length(min=1, max=255))
    description = fields.String(allow_none=True)
    start_time = fields.DateTime()
    end_time = fields.DateTime()
    category = fields.String(
        validate=validate.OneOf(["Work", "Meetings", "Breaks", "Learning", "Personal"])
    )
    color = fields.String()
    status = fields.String(
        validate=validate.OneOf(["not_started", "in_progress", "completed", "overrun"])
    )
    estimated_duration = fields.Integer(allow_none=True, validate=validate.Range(min=1))
    actual_duration = fields.Integer(allow_none=True, validate=validate.Range(min=0))
    notes = fields.String(allow_none=True)
    is_recurring = fields.Boolean()
    recurrence_rule = fields.String(allow_none=True, validate=validate.Length(max=255))

    @validates("color")
    def validate_color(self, value):
        if value and not validate_hex_color(value):
            raise ValidationError("Color must be a valid hex color code")

    @validates_schema
    def validate_time_range(self, data, **kwargs):
        start = data.get("start_time")
        end = data.get("end_time")
        if start and end and end <= start:
            raise ValidationError("end_time must be after start_time")


class TimeboxStatusSchema(Schema):
    status = fields.String(
        required=True,
        validate=validate.OneOf(
            ["not_started", "in_progress", "completed", "overrun"],
            error="Invalid status",
        ),
    )


class TimeboxCompleteSchema(Schema):
    actual_duration = fields.Integer(allow_none=True, load_default=None, validate=validate.Range(min=0))


class TimeboxSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    title = fields.String()
    description = fields.String(allow_none=True)
    start_time = fields.DateTime()
    end_time = fields.DateTime()
    category = fields.String()
    color = fields.String()
    status = fields.String()
    estimated_duration = fields.Integer(allow_none=True)
    actual_duration = fields.Integer(allow_none=True)
    notes = fields.String(allow_none=True)
    is_recurring = fields.Boolean()
    recurrence_rule = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
