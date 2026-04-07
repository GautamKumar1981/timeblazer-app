from datetime import date
from app import db
from app.models.goal import Goal


class GoalService:

    @staticmethod
    def list_goals(user_id: int, status_filter=None, category_filter=None):
        query = Goal.query.filter_by(user_id=user_id)

        if status_filter:
            if status_filter not in Goal.STATUSES:
                return {'error': f'Invalid status. Must be one of: {", ".join(Goal.STATUSES)}'}, 400
            query = query.filter_by(status=status_filter)

        if category_filter:
            query = query.filter_by(category=category_filter)

        goals = query.order_by(Goal.created_at.desc()).all()
        return {'goals': [g.to_dict() for g in goals]}, 200

    @staticmethod
    def create_goal(user_id: int, data: dict):
        title = data.get('title', '').strip()
        if not title:
            return {'error': 'title is required'}, 400

        status = data.get('status', 'active')
        if status not in Goal.STATUSES:
            return {'error': f'Invalid status. Must be one of: {", ".join(Goal.STATUSES)}'}, 400

        progress = data.get('progress', 0)
        if not (0 <= int(progress) <= 100):
            return {'error': 'progress must be between 0 and 100'}, 400

        target_date = None
        if data.get('target_date'):
            try:
                target_date = date.fromisoformat(data['target_date'])
            except ValueError:
                return {'error': 'Invalid target_date format, use YYYY-MM-DD'}, 400

        goal = Goal(
            user_id=user_id,
            title=title,
            description=data.get('description', ''),
            target_date=target_date,
            status=status,
            progress=progress,
            category=data.get('category', 'general'),
        )
        db.session.add(goal)
        db.session.commit()
        return {'goal': goal.to_dict()}, 201

    @staticmethod
    def get_goal(user_id: int, goal_id: int):
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        if not goal:
            return {'error': 'Goal not found'}, 404
        return {'goal': goal.to_dict()}, 200

    @staticmethod
    def update_goal(user_id: int, goal_id: int, data: dict):
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        if not goal:
            return {'error': 'Goal not found'}, 404

        if 'status' in data and data['status'] not in Goal.STATUSES:
            return {'error': f'Invalid status. Must be one of: {", ".join(Goal.STATUSES)}'}, 400

        if 'progress' in data and not (0 <= int(data['progress']) <= 100):
            return {'error': 'progress must be between 0 and 100'}, 400

        for field in ('title', 'description', 'status', 'progress', 'category'):
            if field in data:
                setattr(goal, field, data[field])

        if 'target_date' in data:
            if data['target_date']:
                try:
                    goal.target_date = date.fromisoformat(data['target_date'])
                except ValueError:
                    return {'error': 'Invalid target_date format, use YYYY-MM-DD'}, 400
            else:
                goal.target_date = None

        db.session.commit()
        return {'goal': goal.to_dict()}, 200

    @staticmethod
    def delete_goal(user_id: int, goal_id: int):
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        if not goal:
            return {'error': 'Goal not found'}, 404

        db.session.delete(goal)
        db.session.commit()
        return {'message': 'Goal deleted'}, 200
