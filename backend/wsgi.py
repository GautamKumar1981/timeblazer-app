import os
from app import create_app

app = create_app(os.environ.get('FLASK_ENV', 'production'))

if __name__ == '__main__':
    from app.extensions import socketio
    socketio.run(app, host='0.0.0.0', port=5000)
