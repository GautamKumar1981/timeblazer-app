from marshmallow import Schema, fields, validate, ValidationError


class UserRegistrationSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    timezone = fields.Str(load_default='UTC')


class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class UserUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=1, max=255))
    timezone = fields.Str(validate=validate.Length(max=50))
    theme = fields.Str(validate=validate.OneOf(['light', 'dark']))
    notifications_enabled = fields.Bool()


class PasswordChangeSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
