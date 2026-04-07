# Timeblazer API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require `Authorization: Bearer <access_token>` header.

---

## Authentication

### Register

**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response `201`:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response `200`:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "timezone": "UTC",
    "theme": "light"
  }
}
```

### Refresh Token

**POST** `/auth/refresh` — Requires `Authorization: Bearer <refresh_token>`

Response `200`:
```json
{
  "access_token": "eyJ..."
}
```

### Logout

**POST** `/auth/logout` — Protected

Response `200`:
```json
{ "message": "Successfully logged out" }
```

### Get Current User

**GET** `/auth/me` — Protected

Response `200`:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "timezone": "UTC",
  "theme": "light",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Timeboxes

### List Timeboxes

**GET** `/timeboxes` — Protected

Query params:
- `date` — ISO date string (e.g., `2024-01-15`)
- `start_date` — Range start
- `end_date` — Range end

### Create Timebox

**POST** `/timeboxes` — Protected

```json
{
  "title": "Deep work session",
  "description": "Work on project X",
  "start_time": "2024-01-15T09:00:00",
  "end_time": "2024-01-15T10:30:00",
  "category": "work",
  "color": "#4A90E2"
}
```

### Get Timebox

**GET** `/timeboxes/<id>` — Protected

### Update Timebox

**PUT** `/timeboxes/<id>` — Protected

### Delete Timebox

**DELETE** `/timeboxes/<id>` — Protected

### Update Status

**PATCH** `/timeboxes/<id>/status` — Protected

```json
{
  "status": "completed",
  "actual_duration": 85
}
```

Status values: `scheduled`, `active`, `completed`, `skipped`

### Batch Create

**POST** `/timeboxes/batch` — Protected

```json
{
  "timeboxes": [
    { "title": "Task 1", "start_time": "...", "end_time": "..." },
    { "title": "Task 2", "start_time": "...", "end_time": "..." }
  ]
}
```

---

## Goals

### List Goals

**GET** `/goals` — Protected

Query params:
- `status` — `active`, `completed`, `paused`

### Create Goal

**POST** `/goals` — Protected

```json
{
  "title": "Launch product",
  "description": "Ship v1.0",
  "target_date": "2024-06-30",
  "priority": "high"
}
```

### Get Goal

**GET** `/goals/<id>` — Protected

Response includes `days_remaining` (D-Day countdown).

### Update Goal

**PUT** `/goals/<id>` — Protected

### Delete Goal

**DELETE** `/goals/<id>` — Protected

### Update Progress

**PATCH** `/goals/<id>/progress` — Protected

```json
{ "progress": 75 }
```

---

## Daily Priorities

### Get Today's Priorities

**GET** `/priorities/today` — Protected

### Create/Update Priorities

**POST** `/priorities` — Protected

```json
{
  "priority_1": "Finish feature X",
  "priority_2": "Review PRs",
  "priority_3": "Team standup",
  "notes": "Busy day"
}
```

### Get by Date

**GET** `/priorities/<date>` — Protected

---

## Analytics

### Weekly Summary

**GET** `/analytics/week` — Protected

Query: `week_start=2024-01-15`

Response:
```json
{
  "week_start": "2024-01-15",
  "total_timeboxes": 35,
  "completed": 28,
  "completion_rate": 80.0,
  "daily_breakdown": [...],
  "total_planned_minutes": 1800,
  "total_actual_minutes": 1650
}
```

### Monthly Summary

**GET** `/analytics/month` — Protected

Query: `month=1&year=2024`

### Time Patterns

**GET** `/analytics/patterns` — Protected

Returns productivity patterns by hour and day of week.

### Streaks

**GET** `/analytics/streaks` — Protected

```json
{
  "current_streak": 7,
  "best_streak": 21,
  "streak_start": "2024-01-08"
}
```

---

## Weekly Reviews

### List Reviews

**GET** `/reviews/weekly` — Protected

### Get Review

**GET** `/reviews/weekly/<week_start>` — Protected

### Generate Review

**POST** `/reviews/weekly/generate` — Protected

```json
{ "week_start": "2024-01-15" }
```

Auto-generates review based on analytics data.

### Update Review

**PUT** `/reviews/weekly/<id>` — Protected

```json
{
  "wins": ["Completed sprint", "Exercised 5 days"],
  "improvements": ["Sleep earlier"],
  "insights": "Good week overall",
  "mood": 4
}
```

---

## User Profile

### Get Profile

**GET** `/users/profile` — Protected

### Update Profile

**PUT** `/users/profile` — Protected

```json
{
  "name": "John Doe",
  "timezone": "America/New_York",
  "theme": "dark",
  "notifications_enabled": true
}
```

### Change Password

**PUT** `/users/password` — Protected

```json
{
  "current_password": "oldpass",
  "new_password": "newpass123"
}
```

### Delete Account

**DELETE** `/users/account` — Protected

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict — e.g., email already registered |
| 429 | Too many requests |
| 500 | Internal server error |

---

## WebSocket Events

Connect to `ws://localhost:5000` with auth token.

### Join Room
```json
{ "event": "join", "data": { "user_id": "uuid" } }
```

### Events Emitted to Client

| Event | Description |
|-------|-------------|
| `timebox_created` | New timebox created |
| `timebox_updated` | Timebox updated |
| `timebox_started` | Timer started |
| `timebox_completed` | Timebox completed |
| `goal_updated` | Goal progress updated |
| `analytics_updated` | Analytics recalculated |
