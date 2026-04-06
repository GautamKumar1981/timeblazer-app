# Timeblazer API Documentation

Base URL: `http://localhost:5000`  
All protected endpoints require: `Authorization: Bearer <access_token>`

---

## Authentication

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{ "email": "user@example.com", "password": "secret123", "name": "Alice", "timezone": "America/New_York" }
```
**Response 201:**
```json
{ "user": { "id": 1, "email": "user@example.com", "name": "Alice" }, "access_token": "...", "refresh_token": "..." }
```
**Errors:** `400` validation failed, `409` email already exists

---

### POST /api/auth/login
```json
{ "email": "user@example.com", "password": "secret123" }
```
**Response 200:**
```json
{ "user": { "id": 1, "email": "user@example.com", "name": "Alice" }, "access_token": "...", "refresh_token": "..." }
```

---

### POST /api/auth/refresh
**Header:** `Authorization: Bearer <refresh_token>`  
**Response 200:** `{ "access_token": "..." }`

---

### POST /api/auth/logout
Revokes the current access token.  
**Response 200:** `{ "message": "Logged out" }`

---

## Timeboxes

### GET /api/timeboxes
**Query params:** `date` (YYYY-MM-DD), `status` (pending|completed|skipped), `category`  
**Response 200:**
```json
{ "timeboxes": [{ "id": 1, "title": "Deep work", "startTime": "09:00", "endTime": "10:30", "category": "Work", "color": "#4F46E5", "status": "pending" }] }
```

### POST /api/timeboxes
```json
{ "title": "Deep work", "startTime": "09:00", "endTime": "10:30", "date": "2024-01-15", "category": "Work", "color": "#4F46E5", "description": "Write report", "notes": "" }
```
**Response 201:** `{ "timebox": { ...created timebox } }`

### GET /api/timeboxes/:id
**Response 200:** `{ "timebox": { ... } }`

### PUT /api/timeboxes/:id
Update any field. **Response 200:** `{ "timebox": { ... } }`

### DELETE /api/timeboxes/:id
**Response 204:** No content

### PATCH /api/timeboxes/:id/complete
Mark timebox as completed.  
**Response 200:** `{ "timebox": { ..., "status": "completed" } }`

### PATCH /api/timeboxes/:id/skip
**Response 200:** `{ "timebox": { ..., "status": "skipped" } }`

### GET /api/timeboxes/today
Shortcut for today's timeboxes. **Response 200:** `{ "timeboxes": [...] }`

---

## Goals

### GET /api/goals
**Response 200:** `{ "goals": [{ "id": 1, "title": "Launch MVP", "deadline": "2024-06-01", "daysRemaining": 45 }] }`

### POST /api/goals
```json
{ "title": "Launch MVP", "description": "...", "deadline": "2024-06-01", "category": "Work" }
```
**Response 201:** `{ "goal": { ... } }`

### GET /api/goals/:id
### PUT /api/goals/:id
### DELETE /api/goals/:id

---

## Daily Priorities

### GET /api/priorities?date=YYYY-MM-DD
**Response 200:** `{ "priorities": [{ "id": 1, "title": "Finish report", "order": 1, "completed": false }] }`

### POST /api/priorities
```json
{ "date": "2024-01-15", "priorities": [{ "title": "Finish report", "order": 1 }] }
```
**Response 201:** `{ "priorities": [...] }`

### PUT /api/priorities/:id
Update title or completion status.

---

## Analytics

### GET /api/analytics/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
**Response 200:**
```json
{ "totalTimeboxed": 1440, "completionRate": 0.82, "topCategory": "Work", "streak": 7 }
```

### GET /api/analytics/categories?start=YYYY-MM-DD&end=YYYY-MM-DD
**Response 200:**
```json
{ "categories": [{ "name": "Work", "minutes": 720, "percentage": 50 }] }
```

### GET /api/analytics/daily?start=YYYY-MM-DD&end=YYYY-MM-DD
Daily breakdown of completion rates.

### GET /api/analytics/streak
**Response 200:** `{ "currentStreak": 7, "longestStreak": 21 }`

---

## Reviews

### GET /api/reviews?week=YYYY-WNN
Fetch weekly review for given ISO week.

### POST /api/reviews
```json
{ "week": "2024-W03", "wins": "Completed sprint", "improvements": "Better focus blocks", "rating": 4 }
```
**Response 201:** `{ "review": { ... } }`

---

## User Settings

### GET /api/users/settings
**Response 200:** `{ "settings": { "timezone": "America/New_York", "workdayStart": "09:00", "workdayEnd": "18:00", "theme": "dark" } }`

### PUT /api/users/settings
Update any settings field. **Response 200:** `{ "settings": { ... } }`

---

## WebSocket Events (Socket.io)

| Event | Direction | Payload |
|-------|-----------|---------|
| `timebox:created` | server→client | `{ timebox }` |
| `timebox:updated` | server→client | `{ timebox }` |
| `timebox:deleted` | server→client | `{ id }` |
| `timer:start` | client→server | `{ timeboxId, duration }` |
| `timer:tick` | server→client | `{ timeboxId, remaining }` |
| `timer:complete` | server→client | `{ timeboxId }` |
| `focus:start` | client→server | `{ timeboxId }` |
| `focus:end` | client→server | `{ timeboxId }` |
