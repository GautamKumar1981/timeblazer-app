from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import date


class GoalCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255, error="Title must be between 1 and 255 characters"),
    )
    description = fields.String(allow_none=True, load_default=None)
    target_date = fields.Date(allow_none=True, load_default=None)
    priority = fields.String(
        load_default="medium",
        validate=validate.OneOf(["high", "medium", "low"], error="Invalid priority"),
    )
    status = fields.String(
        load_default="active",
        validate=validate.OneOf(["active", "completed", "cancelled"], error="Invalid status"),
    )
    milestones = fields.List(fields.Dict(), load_default=list)

    @validates("target_date")
    def validate_target_date(self, value):
        if value and value < date.today():
            raise ValidationError("target_date cannot be in the past")


class GoalUpdateSchema(Schema):
    title = fields.String(validate=validate.Length(min=1, max=255))
    description = fields.String(allow_none=True)
    target_date = fields.Date(allow_none=True)
    priority = fields.String(validate=validate.OneOf(["high", "medium", "low"]))
    status = fields.String(validate=validate.OneOf(["active", "completed", "cancelled"]))
    milestones = fields.List(fields.Dict())


class GoalSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    title = fields.String()
    description = fields.String(allow_none=True)
    target_date = fields.Date(allow_none=True)
    priority = fields.String()
    status = fields.String()
    milestones = fields.List(fields.Dict())
    days_remaining = fields.Integer(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
