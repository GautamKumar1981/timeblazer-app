from flask import jsonify
from app.api import api_bp
from app.extensions import db


@api_bp.route('/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(db.text('SELECT 1'))
        db_status = 'ok'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return jsonify({'status': 'ok', 'database': db_status}), 200
