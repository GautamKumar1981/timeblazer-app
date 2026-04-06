from datetime import datetime, timezone

from app import db
from app.models.goal import Goal


class GoalServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


class GoalService:
    @staticmethod
    def get_goals(user_id: int) -> list[Goal]:
        return Goal.query.filter_by(user_id=user_id).order_by(Goal.created_at.desc()).all()

    @staticmethod
    def create_goal(user_id: int, data: dict) -> Goal:
        goal = Goal(
            user_id=user_id,
            title=data["title"],
            description=data.get("description"),
            target_date=data.get("target_date"),
            priority=data.get("priority", "medium"),
            status=data.get("status", "active"),
            milestones=data.get("milestones", []),
        )
        db.session.add(goal)
        db.session.commit()
        return goal

    @staticmethod
    def get_goal(goal_id: int, user_id: int) -> Goal:
        goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
        if not goal:
            raise GoalServiceError("Goal not found", 404)
        return goal

    @staticmethod
    def update_goal(goal_id: int, user_id: int, data: dict) -> Goal:
        goal = GoalService.get_goal(goal_id, user_id)

        allowed_fields = ["title", "description", "target_date", "priority", "status", "milestones"]
        for field in allowed_fields:
            if field in data:
                setattr(goal, field, data[field])

        goal.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return goal

    @staticmethod
    def delete_goal(goal_id: int, user_id: int) -> None:
        goal = GoalService.get_goal(goal_id, user_id)
        db.session.delete(goal)
        db.session.commit()
