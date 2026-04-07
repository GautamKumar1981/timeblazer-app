# Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend/mobile development)
- Python 3.11+ (for local backend development)
- Git

## Quick Start with Docker

```bash
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app
docker-compose up -d
```

Services:
- Web app: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
flask run
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| FLASK_ENV | Environment | development |
| SECRET_KEY | Flask secret key | (required) |
| DATABASE_URL | PostgreSQL connection URL | (required) |
| JWT_SECRET_KEY | JWT signing key | (required) |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |
| REACT_APP_SOCKET_URL | WebSocket URL | http://localhost:5000 |

## Database Setup

The database tables are created automatically on first run. To run with a fresh database:

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
```
