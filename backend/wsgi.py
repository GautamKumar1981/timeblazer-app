import sys
import traceback
from flask import Flask, jsonify

_startup_error = None

try:
    from app import create_app
    app = create_app()
    print("✓ DragonHour app created successfully", flush=True)
except Exception as e:
    _startup_error = traceback.format_exc()
    print("✗ STARTUP ERROR:\n", _startup_error, flush=True)

    # Fallback minimal app so gunicorn binds to PORT and health check passes.
    # The error is visible in Railway's Deploy Logs.
    app = Flask(__name__)

    @app.route('/health')
    @app.route('/')
    def error_info():
        return jsonify({
            'status': 'startup_failed',
            'error': _startup_error,
        }), 500

if __name__ == '__main__':
    app.run()
