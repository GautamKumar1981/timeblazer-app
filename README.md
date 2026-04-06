# Timeblazer - Complete Timeboxing Productivity App

## Overview

Timeblazer is a full-stack productivity application built around the timeboxing methodology — the practice of allocating fixed time blocks to tasks in advance. It combines structured daily planning with focus tools, goal tracking, and analytics to help you take control of your time and build lasting productivity habits.

## Features

- **Timeboxing** — Create color-coded time blocks on a visual daily calendar
- **Top 3 Priorities** — Identify and commit to your three most important tasks each day
- **D-Day Countdown** — Set goal deadlines and track days remaining
- **Year Progress** — Visual indicator of how much of the year has elapsed
- **Focus Mode** — Full-screen distraction-free timer with keyboard shortcuts
- **Parking Lot** — Capture interruptions and ideas without breaking focus
- **Streak Tracking** — Build consistency with daily planning streaks
- **Weekly Review** — Auto-generated insights and reflection prompts
- **Analytics** — Charts and metrics for time allocation and productivity trends
- **Categories & Color Coding** — Organize tasks by project or life area
- **Drag & Drop Calendar** — Reschedule timeboxes visually
- **Multi-platform** — Web and mobile (iOS/Android) apps

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, Flask, PostgreSQL 15, Redis 7, Celery |
| Web Frontend | React 18, TypeScript, Redux Toolkit, Tailwind CSS |
| Mobile | React Native, Expo, React Navigation |

## Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/your-org/timeblazer-app.git
cd timeblazer-app
cp backend/.env.example backend/.env
docker-compose up -d
```

- Web app: http://localhost:3000
- API: http://localhost:5000

### Manual Setup

**Backend:**
```bash
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
flask db upgrade && python -m app.main
```

**Frontend:**
```bash
cd frontend && npm install && npm start
```

**Mobile:**
```bash
cd mobile && npm install && expo start
```

See [SETUP.md](SETUP.md) for detailed instructions.

## Project Structure

```
timeblazer-app/
├── backend/          # Flask API server
│   ├── app/
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routes/   # API blueprints
│   │   ├── services/ # Business logic
│   │   └── main.py   # App factory
│   ├── migrations/
│   └── requirements.txt
├── frontend/         # React web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/    # Redux slices
│   │   └── services/ # API client
│   └── package.json
├── mobile/           # React Native app
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Documentation

See [API.md](API.md) for full endpoint reference.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes following conventional commits
4. Open a pull request

See [DEVELOPER.md](DEVELOPER.md) for detailed contribution guidelines.

## License

MIT
