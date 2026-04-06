from marshmallow import Schema, fields, validate, validates, ValidationError, post_load


class UserRegisterSchema(Schema):
    email = fields.Email(required=True, error_messages={"required": "Email is required"})
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, error="Password must be at least 8 characters"),
    )
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255, error="Name must be between 1 and 255 characters"),
    )
    timezone = fields.String(load_default="UTC", validate=validate.Length(max=64))


class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)


class UserUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=255))
    timezone = fields.String(validate=validate.Length(max=64))
    profile_picture_url = fields.Url(allow_none=True, load_default=None)
    theme = fields.String(validate=validate.OneOf(["light", "dark"]))


class UserSchema(Schema):
    id = fields.Integer(dump_only=True)
    email = fields.Email(dump_only=True)
    name = fields.String()
    timezone = fields.String()
    profile_picture_url = fields.String(allow_none=True)
    theme = fields.String()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
