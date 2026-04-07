# Timeblazer Setup Guide

## Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **Git**

---

## Option 1: Docker Setup (Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and update:
- `SECRET_KEY` — a strong random string
- `JWT_SECRET_KEY` — another strong random string

### 3. Start All Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Flask API** on port 5000
- **React App** on port 3000

### 4. Verify Services

```bash
docker-compose ps
```

All services should show `Up`. Then visit:
- http://localhost:3000 — Web app
- http://localhost:5000/api/health — API health check

### 5. Stop Services

```bash
docker-compose down
# To remove data volumes too:
docker-compose down -v
```

---

## Option 2: Manual Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
flask db upgrade

# Start server
python wsgi.py
```

The API runs at http://localhost:5000.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm start
```

The web app runs at http://localhost:3000.

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Install Expo CLI
npm install -g expo-cli

# Configure environment
cp .env.example .env

# Start Expo server
npm start
```

Scan the QR code with **Expo Go** app on your phone.

---

## Database Setup

Timeblazer uses **PostgreSQL**. The Docker setup handles this automatically.

For manual setup:

```sql
CREATE DATABASE timeblazer_db;
CREATE USER timeblazer_user WITH PASSWORD 'timeblazer_password';
GRANT ALL PRIVILEGES ON DATABASE timeblazer_db TO timeblazer_user;
```

### Run Migrations

```bash
cd backend
flask db upgrade
```

---

## Environment Variables

### Backend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection URL |
| `SECRET_KEY` | `change-me` | Flask secret key |
| `JWT_SECRET_KEY` | `change-me` | JWT signing key |
| `FLASK_ENV` | `development` | Flask environment |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

### Frontend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | Backend API URL |
| `REACT_APP_WS_URL` | `ws://localhost:5000` | WebSocket URL |

---

## Running Tests

### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Troubleshooting

### Docker port conflicts

If ports 3000, 5000, or 5432 are in use:

```bash
# Find process using port 5432
lsof -i :5432
# Kill it
kill -9 <PID>
```

### Database connection failed

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Backend import errors

```bash
docker-compose logs backend
# Usually a missing package — rebuild:
docker-compose build backend
docker-compose up -d
```

### Frontend won't start

```bash
cd frontend
rm -rf node_modules
npm install
npm start
```
