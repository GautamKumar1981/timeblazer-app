# Timeblazer - Time Management App

Timeblazer is a productivity and time management application that helps you manage your day through timeboxing, goal tracking, and analytics.

## Features

- **Timeboxing**: Schedule and manage time blocks for tasks
- **Goal Tracking**: Set and track goals with progress and D-Day countdown
- **Daily Priorities**: Focus on your top 3 priorities each day
- **Analytics**: Track productivity scores and focus time
- **Weekly Reviews**: Reflect on your week with structured reviews
- **Focus Mode**: Distraction-free full-screen timer
- **Real-time Sync**: WebSocket-powered live updates

## Architecture

- **Backend**: Python/Flask REST API with PostgreSQL
- **Frontend**: React 18 + TypeScript SPA
- **Mobile**: React Native/Expo app

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app

# Start all services
docker-compose up -d

# Access the app
# Web:    http://localhost:3000
# API:    http://localhost:5000
# DB:     localhost:5432
```

See [SETUP.md](SETUP.md) for detailed installation instructions.
Complete Timeblazer Timeboxing App - Web, Mobile &amp; Backend
