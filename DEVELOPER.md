# Developer Guide

## Architecture Overview

```
┌─────────────┐     HTTP/WS      ┌──────────────────┐
│   React Web │ ──────────────▶  │   Flask API       │
│  (frontend/)│                  │   (backend/)      │
└─────────────┘                  │                   │
                                 │  ┌─────────────┐  │
┌─────────────┐     HTTP/WS      │  │ PostgreSQL   │  │
│ React Native│ ──────────────▶  │  └─────────────┘  │
│  (mobile/)  │                  │  ┌─────────────┐  │
└─────────────┘                  │  │    Redis     │  │
                                 │  └─────────────┘  │
                                 │  ┌─────────────┐  │
                                 │  │   Celery     │  │
                                 │  └─────────────┘  │
                                 └──────────────────┘
```

---

## Development Setup

```bash
git clone https://github.com/your-org/timeblazer-app.git
cd timeblazer-app
docker-compose up -d
docker-compose exec backend flask db upgrade
```

Or follow the manual steps in [SETUP.md](SETUP.md).

---

## Code Structure

| Directory | Purpose |
|-----------|---------|
| `backend/app/models/` | SQLAlchemy ORM models |
| `backend/app/routes/` | Flask blueprints (one per resource) |
| `backend/app/services/` | Business logic, decoupled from HTTP |
| `backend/migrations/` | Alembic migration files |
| `frontend/src/components/` | Reusable UI components |
| `frontend/src/pages/` | Route-level page components |
| `frontend/src/store/` | Redux Toolkit slices |
| `frontend/src/services/` | Axios API client wrappers |
| `mobile/src/` | React Native screens and components |

---

## Backend Development

**App factory pattern:**
```python
# backend/app/main.py
def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(config or Config)
    db.init_app(app)
    register_blueprints(app)
    return app
```

**Adding a new model:**
1. Create `backend/app/models/my_model.py` with a SQLAlchemy class
2. Import it in `backend/app/models/__init__.py`
3. Run `flask db migrate -m "add my_model" && flask db upgrade`

**Creating an API endpoint:**
1. Add a blueprint in `backend/app/routes/`
2. Register it in the app factory
3. Add tests in `backend/tests/`

**Running tests:**
```bash
cd backend && pytest -v
```

**Database migrations:**
```bash
flask db migrate -m "describe the change"
flask db upgrade
```

---

## Frontend Development

**Adding a Redux slice:**
```typescript
// frontend/src/store/mySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
export const fetchItems = createAsyncThunk('items/fetch', async () => { ... });
```

**API integration pattern:**
```typescript
// frontend/src/services/api.ts
import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
// Attach JWT token via request interceptor
```

**TypeScript conventions:**
- Use interfaces for API response shapes
- Use `type` for unions and utility types
- No `any` — use `unknown` and narrow instead

---

## Mobile Development

- **Expo managed workflow** — no native code unless ejecting
- Test on simulator: `expo start --ios` / `expo start --android`
- Test on device: scan QR code with Expo Go
- Build for production: `expo build:ios` / `expo build:android`
- API base URL is set in `mobile/src/services/api.ts`

---

## Testing Strategy

| Layer | Tool | Command |
|-------|------|---------|
| Backend unit/integration | pytest | `cd backend && pytest -v` |
| Frontend unit | Jest + React Testing Library | `cd frontend && npm test` |
| E2E | Not implemented | — |

Backend tests use an in-memory SQLite database by default (configured in `backend/tests/conftest.py`).

---

## Contributing Guidelines

- **Branch naming:** `feature/short-description`, `fix/issue-number-description`
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- **PR process:** Open a PR against `main`, ensure CI passes, request one reviewer
- **Code review:** All public functions need docstrings; no secrets in code; tests for new endpoints
