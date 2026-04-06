from marshmallow import Schema, fields, validate


class PriorityCreateSchema(Schema):
    date = fields.Date(load_default=None)
    priority_1 = fields.String(allow_none=True, load_default=None, validate=validate.Length(max=255))
    priority_2 = fields.String(allow_none=True, load_default=None, validate=validate.Length(max=255))
    priority_3 = fields.String(allow_none=True, load_default=None, validate=validate.Length(max=255))
    completion_status = fields.Integer(load_default=0, validate=validate.Range(min=0, max=7))


class PriorityUpdateSchema(Schema):
    priority_1 = fields.String(allow_none=True, validate=validate.Length(max=255))
    priority_2 = fields.String(allow_none=True, validate=validate.Length(max=255))
    priority_3 = fields.String(allow_none=True, validate=validate.Length(max=255))
    completion_status = fields.Integer(validate=validate.Range(min=0, max=7))


class PrioritySchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    date = fields.Date()
    priority_1 = fields.String(allow_none=True)
    priority_2 = fields.String(allow_none=True)
    priority_3 = fields.String(allow_none=True)
    completion_status = fields.Integer()
    created_at = fields.DateTime(dump_only=True)
