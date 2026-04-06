from datetime import datetime, timezone, date
from typing import Optional

from app import db
from app.models.timebox import Timebox, TimeboxStatus


class TimeboxServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


class TimeboxService:
    @staticmethod
    def get_timeboxes(
        user_id: int,
        date_filter: Optional[date] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[Timebox]:
        query = Timebox.query.filter_by(user_id=user_id)

        if date_filter:
            from sqlalchemy import func
            query = query.filter(func.date(Timebox.start_time) == date_filter)

        if status:
            query = query.filter(Timebox.status == status)

        if category:
            query = query.filter(Timebox.category == category)

        return query.order_by(Timebox.start_time.asc()).all()

    @staticmethod
    def create_timebox(user_id: int, data: dict) -> Timebox:
        timebox = Timebox(
            user_id=user_id,
            title=data["title"],
            description=data.get("description"),
            start_time=data["start_time"],
            end_time=data["end_time"],
            category=data.get("category", "Work"),
            color=data.get("color", "#4F46E5"),
            status=data.get("status", "not_started"),
            estimated_duration=data.get("estimated_duration"),
            actual_duration=data.get("actual_duration"),
            notes=data.get("notes"),
            is_recurring=data.get("is_recurring", False),
            recurrence_rule=data.get("recurrence_rule"),
        )
        db.session.add(timebox)
        db.session.commit()
        return timebox

    @staticmethod
    def get_timebox(timebox_id: int, user_id: int) -> Timebox:
        timebox = Timebox.query.filter_by(id=timebox_id, user_id=user_id).first()
        if not timebox:
            raise TimeboxServiceError("Timebox not found", 404)
        return timebox

    @staticmethod
    def update_timebox(timebox_id: int, user_id: int, data: dict) -> Timebox:
        timebox = TimeboxService.get_timebox(timebox_id, user_id)

        allowed_fields = [
            "title", "description", "start_time", "end_time", "category",
            "color", "status", "estimated_duration", "actual_duration",
            "notes", "is_recurring", "recurrence_rule",
        ]
        for field in allowed_fields:
            if field in data:
                setattr(timebox, field, data[field])

        timebox.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return timebox

    @staticmethod
    def delete_timebox(timebox_id: int, user_id: int) -> None:
        timebox = TimeboxService.get_timebox(timebox_id, user_id)
        db.session.delete(timebox)
        db.session.commit()

    @staticmethod
    def update_status(timebox_id: int, user_id: int, status: str) -> Timebox:
        timebox = TimeboxService.get_timebox(timebox_id, user_id)
        timebox.status = status
        timebox.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return timebox

    @staticmethod
    def complete_timebox(timebox_id: int, user_id: int, actual_duration: Optional[int] = None) -> Timebox:
        timebox = TimeboxService.get_timebox(timebox_id, user_id)
        timebox.status = TimeboxStatus.COMPLETED
        if actual_duration is not None:
            timebox.actual_duration = actual_duration
        elif timebox.start_time and timebox.end_time:
            delta = timebox.end_time - timebox.start_time
            timebox.actual_duration = int(delta.total_seconds() / 60)
        timebox.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return timebox

    @staticmethod
    def create_batch(user_id: int, timeboxes_data: list[dict]) -> list[Timebox]:
        timeboxes = []
        for data in timeboxes_data:
            timebox = Timebox(
                user_id=user_id,
                title=data["title"],
                description=data.get("description"),
                start_time=data["start_time"],
                end_time=data["end_time"],
                category=data.get("category", "Work"),
                color=data.get("color", "#4F46E5"),
                status=data.get("status", "not_started"),
                estimated_duration=data.get("estimated_duration"),
                actual_duration=data.get("actual_duration"),
                notes=data.get("notes"),
                is_recurring=data.get("is_recurring", False),
                recurrence_rule=data.get("recurrence_rule"),
            )
            timeboxes.append(timebox)

        db.session.add_all(timeboxes)
        db.session.commit()
        return timeboxes
