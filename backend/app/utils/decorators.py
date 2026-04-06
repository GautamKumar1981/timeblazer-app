from functools import wraps

from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from marshmallow import ValidationError


def jwt_required_custom(fn):
    """JWT required decorator with structured error responses."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({"error": "Authentication required", "code": "unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper


def validate_json(schema_class):
    """Decorator that validates JSON request body against a Marshmallow schema.

    Injects validated `data` keyword argument into the wrapped function.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            json_data = request.get_json(silent=True)
            if json_data is None:
                return jsonify({"error": "Request body must be valid JSON"}), 400
            schema = schema_class()
            try:
                data = schema.load(json_data)
            except ValidationError as exc:
                return jsonify({"error": "Validation failed", "details": exc.messages}), 400
            return fn(*args, data=data, **kwargs)
        return wrapper
    return decorator
