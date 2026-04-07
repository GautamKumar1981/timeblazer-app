from datetime import datetime, date
from app import db
from app.models.timebox import Timebox


class TimeboxService:

    @staticmethod
    def list_timeboxes(user_id: int, date_filter=None, start_date=None, end_date=None):
        query = Timebox.query.filter_by(user_id=user_id)

        if date_filter:
            try:
                filter_date = date.fromisoformat(date_filter)
                query = query.filter(
                    db.func.date(Timebox.start_time) == filter_date
                )
            except ValueError:
                return {'error': 'Invalid date format, use YYYY-MM-DD'}, 400

        if start_date:
            try:
                sd = datetime.fromisoformat(start_date)
                query = query.filter(Timebox.start_time >= sd)
            except ValueError:
                return {'error': 'Invalid start_date format'}, 400

        if end_date:
            try:
                ed = datetime.fromisoformat(end_date)
                query = query.filter(Timebox.end_time <= ed)
            except ValueError:
                return {'error': 'Invalid end_date format'}, 400

        timeboxes = query.order_by(Timebox.start_time).all()
        return {'timeboxes': [t.to_dict() for t in timeboxes]}, 200

    @staticmethod
    def create_timebox(user_id: int, data: dict):
        title = data.get('title', '').strip()
        if not title:
            return {'error': 'title is required'}, 400

        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        if not start_time_str or not end_time_str:
            return {'error': 'start_time and end_time are required'}, 400

        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = datetime.fromisoformat(end_time_str)
        except ValueError:
            return {'error': 'Invalid datetime format, use ISO 8601'}, 400

        if end_time <= start_time:
            return {'error': 'end_time must be after start_time'}, 400

        priority = data.get('priority', 3)
        try:
            priority = int(priority)
        except (TypeError, ValueError):
            return {'error': 'priority must be an integer between 1 and 5'}, 400
        if not (1 <= priority <= 5):
            return {'error': 'priority must be between 1 and 5'}, 400

        timebox = Timebox(
            user_id=user_id,
            title=title,
            description=data.get('description', ''),
            start_time=start_time,
            end_time=end_time,
            category=data.get('category', 'general'),
            color=data.get('color', '#3B82F6'),
            completed=data.get('completed', False),
            priority=priority,
        )
        db.session.add(timebox)
        db.session.commit()
        return {'timebox': timebox.to_dict()}, 201

    @staticmethod
    def get_timebox(user_id: int, timebox_id: int):
        timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
        if not timebox:
            return {'error': 'Timebox not found'}, 404
        return {'timebox': timebox.to_dict()}, 200

    @staticmethod
    def update_timebox(user_id: int, timebox_id: int, data: dict):
        timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
        if not timebox:
            return {'error': 'Timebox not found'}, 404

        for field in ('title', 'description', 'category', 'color', 'completed', 'priority'):
            if field in data:
                setattr(timebox, field, data[field])

        for dt_field in ('start_time', 'end_time'):
            if dt_field in data:
                try:
                    setattr(timebox, dt_field, datetime.fromisoformat(data[dt_field]))
                except ValueError:
                    return {'error': f'Invalid {dt_field} format'}, 400

        if timebox.end_time <= timebox.start_time:
            return {'error': 'end_time must be after start_time'}, 400

        db.session.commit()
        return {'timebox': timebox.to_dict()}, 200

    @staticmethod
    def delete_timebox(user_id: int, timebox_id: int):
        timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
        if not timebox:
            return {'error': 'Timebox not found'}, 404

        db.session.delete(timebox)
        db.session.commit()
        return {'message': 'Timebox deleted'}, 200

    @staticmethod
    def complete_timebox(user_id: int, timebox_id: int):
        timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
        if not timebox:
            return {'error': 'Timebox not found'}, 404

        timebox.completed = True
        db.session.commit()
        return {'timebox': timebox.to_dict()}, 200
