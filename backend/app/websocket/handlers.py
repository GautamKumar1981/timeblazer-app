from flask_socketio import join_room, leave_room, emit
from flask_jwt_extended import decode_token
from app import socketio
from app.websocket.events import (
    TIMEBOX_CREATED, TIMEBOX_UPDATED, TIMEBOX_STARTED,
    TIMEBOX_COMPLETED, GOAL_UPDATED, ANALYTICS_UPDATED,
)


@socketio.on('join')
def handle_join_room(data: dict) -> None:
    """User joins their personal room identified by user_id."""
    token = data.get('token')
    if not token:
        emit('error', {'message': 'Missing token'})
        return
    try:
        decoded = decode_token(token)
        user_id = decoded.get('sub')
        room = f'user_{user_id}'
        join_room(room)
        emit('joined', {'room': room})
    except Exception:
        emit('error', {'message': 'Invalid token'})


@socketio.on('leave')
def handle_leave_room(data: dict) -> None:
    """User leaves their personal room."""
    token = data.get('token')
    if not token:
        emit('error', {'message': 'Missing token'})
        return
    try:
        decoded = decode_token(token)
        user_id = decoded.get('sub')
        room = f'user_{user_id}'
        leave_room(room)
        emit('left', {'room': room})
    except Exception:
        emit('error', {'message': 'Invalid token'})


def emit_timebox_update(user_id: str, event: str, data: dict) -> None:
    """Broadcast a timebox event to a user's personal room."""
    room = f'user_{user_id}'
    socketio.emit(event, data, room=room)
