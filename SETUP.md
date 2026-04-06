# Setup Guide

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 15+ |
| Redis | 7+ |
| Docker & Docker Compose | Optional but recommended |
| Expo CLI | For mobile development |

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Edit .env with your values
```

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE timeblazer;"
psql -U postgres -c "CREATE USER timeblazer WITH PASSWORD 'timeblazer_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE timeblazer TO timeblazer;"
```

Run migrations and start the server:

```bash
flask db upgrade
python -m app.main
```

API will be available at http://localhost:5000.

---

## Frontend Setup

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm start
```

App will be available at http://localhost:3000.

---

## Mobile Setup

```bash
cd mobile
npm install
npm install -g expo-cli
expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) to run on your device.

---

## Docker Setup

```bash
cp backend/.env.example backend/.env   # Edit with production-safe values
docker-compose up -d
docker-compose exec backend flask db upgrade
```

Services:

| Service | URL |
|---------|-----|
| Web frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Logs: `docker-compose logs -f <service>`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://timeblazer:password@localhost:5432/timeblazer` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | Flask session secret | random 32-char string |
| `JWT_SECRET_KEY` | JWT signing secret | random 32-char string |
| `FLASK_ENV` | `development` or `production` | `development` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000` |
