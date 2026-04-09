import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from .models import db, User, Timebox, Goal


def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def register_routes(app):

    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'Timeblazer API is running'}), 200

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        if not email or not password or not name:
            return jsonify({'error': 'Email, password and name are required'}), 400

        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = User(email=email, password_hash=password_hash, name=name)
        db.session.add(user)
        db.session.commit()

        token = generate_token(user.id)
        return jsonify({'token': token, 'user': user.to_dict()}), 201

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid email or password'}), 401

        token = generate_token(user.id)
        return jsonify({'token': token, 'user': user.to_dict()}), 200

    @app.route('/api/auth/me', methods=['GET'])
    @token_required
    def get_me(current_user):
        return jsonify({'user': current_user.to_dict()}), 200

    @app.route('/api/timeboxes', methods=['GET'])
    @token_required
    def get_timeboxes(current_user):
        timeboxes = Timebox.query.filter_by(user_id=current_user.id).order_by(Timebox.start_time.desc()).all()
        return jsonify({'timeboxes': [t.to_dict() for t in timeboxes]}), 200

    @app.route('/api/timeboxes', methods=['POST'])
    @token_required
    def create_timebox(current_user):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        title = data.get('title', '').strip()
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if not title or not start_time or not end_time:
            return jsonify({'error': 'Title, start_time and end_time are required'}), 400

        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return jsonify({'error': 'Invalid date format. Use ISO 8601.'}), 400

        if end_dt <= start_dt:
            return jsonify({'error': 'end_time must be after start_time'}), 400

        timebox = Timebox(
            user_id=current_user.id,
            title=title,
            start_time=start_dt,
            end_time=end_dt,
            status=data.get('status', 'pending')
        )
        db.session.add(timebox)
        db.session.commit()
        return jsonify({'timebox': timebox.to_dict()}), 201

    @app.route('/api/goals', methods=['GET'])
    @token_required
    def get_goals(current_user):
        goals = Goal.query.filter_by(user_id=current_user.id).order_by(Goal.created_at.desc()).all()
        return jsonify({'goals': [g.to_dict() for g in goals]}), 200

    @app.route('/api/goals', methods=['POST'])
    @token_required
    def create_goal(current_user):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        title = data.get('title', '').strip()
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        target_date = None
        if data.get('target_date'):
            try:
                target_date = datetime.fromisoformat(data['target_date'].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({'error': 'Invalid target_date format. Use ISO 8601.'}), 400

        goal = Goal(
            user_id=current_user.id,
            title=title,
            target_date=target_date,
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'active')
        )
        db.session.add(goal)
        db.session.commit()
        return jsonify({'goal': goal.to_dict()}), 201
