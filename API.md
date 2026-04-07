# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints (except auth) require `Authorization: Bearer <token>` header.

## Authentication

### Register
`POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

Response: `201` with `{ "token": "...", "user": {...} }`

### Login
`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: `200` with `{ "token": "...", "user": {...} }`

### Get Current User
`GET /api/auth/me`

Response: `200` with user object

## Timeboxes

### List Timeboxes
`GET /api/timeboxes?date=2024-01-15`

### Create Timebox
`POST /api/timeboxes`

```json
{
  "title": "Deep Work Session",
  "start_time": "2024-01-15T09:00:00",
  "end_time": "2024-01-15T11:00:00",
  "category": "work",
  "color": "#4F46E5",
  "priority": 1
}
```

### Update Timebox
`PUT /api/timeboxes/<id>`

### Delete Timebox
`DELETE /api/timeboxes/<id>`

### Complete Timebox
`POST /api/timeboxes/<id>/complete`

## Goals

### List Goals
`GET /api/goals`

### Create Goal
`POST /api/goals`

```json
{
  "title": "Learn TypeScript",
  "description": "Master TypeScript for frontend development",
  "target_date": "2024-03-31",
  "category": "learning",
  "progress": 0
}
```

### Update Goal
`PUT /api/goals/<id>`

### Delete Goal
`DELETE /api/goals/<id>`

## Daily Priorities

### List Priorities
`GET /api/priorities?date=2024-01-15`

### Create Priority
`POST /api/priorities`

```json
{
  "title": "Complete project proposal",
  "date": "2024-01-15",
  "priority_order": 1
}
```

### Update Priority
`PUT /api/priorities/<id>`

### Delete Priority
`DELETE /api/priorities/<id>`

## Analytics

### Summary
`GET /api/analytics/summary?days=7`

### Productivity Data
`GET /api/analytics/productivity?start=2024-01-01&end=2024-01-31`

### Weekly Analytics
`GET /api/analytics/weekly`

## Reviews

### List Reviews
`GET /api/reviews`

### Create Review
`POST /api/reviews`

```json
{
  "week_start": "2024-01-08",
  "week_end": "2024-01-14",
  "accomplishments": "Completed project X",
  "challenges": "Time management issues",
  "goals_next_week": "Start project Y",
  "overall_rating": 4
}
```

### Update Review
`PUT /api/reviews/<id>`
