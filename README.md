# ⏱ Timeblazer - Timeboxing Productivity App

A production-ready timeboxing application to supercharge your productivity with structured time management.

## Features

- **Timeboxing** — Schedule tasks in fixed time blocks with a real-time countdown timer
- **Top 3 Priorities** — Focus on what matters most each day
- **Goal Tracking** — Set goals with D-Day countdowns and progress tracking
- **Analytics** — Completion rates, patterns, accuracy metrics, and streak tracking
- **Weekly Review** — Reflect on your week with auto-generated insights
- **Focus Mode** — Distraction-free full-screen timer
- **Real-time Sync** — WebSocket-based live updates across devices
- **Mobile App** — React Native app for iOS and Android

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python / Flask / SQLAlchemy / PostgreSQL |
| Frontend | React 18 / TypeScript / Redux Toolkit |
| Mobile | React Native / Expo |
| Real-time | Flask-SocketIO / Socket.io-client |
| Auth | JWT (Flask-JWT-Extended) |
| Database | PostgreSQL 15 |
| Container | Docker / Docker Compose |

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.11+

### Using Docker (recommended)

```bash
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

Access:
- **Web App**: http://localhost:3000
- **API**: http://localhost:5000
- **Database**: localhost:5432

### Manual Setup

See [SETUP.md](SETUP.md) for full instructions.

## Project Structure

```
timeblazer-app/
├── backend/          # Python Flask API
├── frontend/         # React TypeScript web app
├── mobile/           # React Native mobile app
├── docker-compose.yml
├── SETUP.md
├── API.md
├── DEPLOYMENT.md
└── USER_GUIDE.md
```

## Documentation

- [Setup Guide](SETUP.md) — Local development setup
- [API Reference](API.md) — REST API documentation
- [Deployment Guide](DEPLOYMENT.md) — Production deployment
- [User Guide](USER_GUIDE.md) — How to use the app

## License

MIT
