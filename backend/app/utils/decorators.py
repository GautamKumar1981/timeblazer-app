from functools import wraps
from flask import request, jsonify


def require_json(f):
    """Decorator that enforces Content-Type: application/json on the request."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 415
        return f(*args, **kwargs)
    return decorated


def paginate(f):
    """Decorator that injects pagination parameters (page, per_page) from query string."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 20))
        except ValueError:
            return jsonify({'error': 'Invalid pagination parameters'}), 400

        page = max(1, page)
        per_page = max(1, min(per_page, 100))
        kwargs['page'] = page
        kwargs['per_page'] = per_page
        return f(*args, **kwargs)
    return decorated
