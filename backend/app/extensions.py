from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
cors = CORS()
socketio = SocketIO()
limiter = Limiter(key_func=get_remote_address)
