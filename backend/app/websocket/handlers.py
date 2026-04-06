from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit

from app import socketio


def emit_to_user(user_id: int, event: str, data: dict) -> None:
    """Emit a SocketIO event to the private room of a specific user."""
    room = f"user_{user_id}"
    socketio.emit(event, data, room=room)


@socketio.on("connect")
def on_connect(auth):
    """Authenticate via JWT token and join the user's private room."""
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")
    if not token:
        # Fallback to query string
        token = request.args.get("token")

    if not token:
        return False  # Reject connection

    try:
        decoded = decode_token(token)
        user_id = decoded.get("sub")
        room = f"user_{user_id}"
        join_room(room)
        emit("connected", {"message": "Connected to Timeblazer", "user_id": user_id})
    except Exception:
        return False  # Reject connection


@socketio.on("disconnect")
def on_disconnect():
    """Clean up on disconnect — rooms are automatically left by SocketIO."""
    pass


@socketio.on("join")
def on_join(data):
    """Explicit room join event (optional, for compatibility)."""
    room = data.get("room")
    if room:
        join_room(room)
        emit("joined", {"room": room})


@socketio.on("leave")
def on_leave(data):
    """Explicit room leave event."""
    room = data.get("room")
    if room:
        leave_room(room)
        emit("left", {"room": room})
