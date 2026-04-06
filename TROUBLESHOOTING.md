# Troubleshooting Guide

---

## Backend Issues

### Database connection error
**Symptom:** `sqlalchemy.exc.OperationalError: could not connect to server`  
**Fix:**
- Check `DATABASE_URL` in `backend/.env`
- Ensure PostgreSQL is running: `pg_isready -h localhost -U timeblazer`
- Docker: `docker-compose ps db` — must show `healthy`

### JWT errors (401 Unauthorized)
**Symptom:** `Missing or invalid token`  
**Fix:** Verify `JWT_SECRET_KEY` is set in `.env` and matches between restarts.

### Migration errors
**Symptom:** `alembic.util.exc.CommandError: Target database is not up to date`  
**Fix:**
```bash
flask db stamp head   # mark DB as current
flask db migrate && flask db upgrade
```
For a fresh start: drop and recreate the database, then re-run `flask db upgrade`.

### Port 5000 already in use
```bash
lsof -ti:5000 | xargs kill -9
```

---

## Frontend Issues

### API connection refused
**Symptom:** `Network Error` or `ERR_CONNECTION_REFUSED`  
**Fix:** Ensure `REACT_APP_API_URL` in `frontend/.env` points to the running backend (e.g., `http://localhost:5000`).

### CORS errors
**Symptom:** Browser console shows `Access-Control-Allow-Origin` errors  
**Fix:** Add your frontend origin to `CORS_ORIGINS` in `backend/.env`, e.g.:
```
CORS_ORIGINS=http://localhost:3000
```

### Build failures
```bash
rm -rf frontend/node_modules frontend/build
cd frontend && npm install && npm run build
```

---

## Mobile Issues

### Metro bundler issues
```bash
expo start --clear
```

### Expo Go not loading / blank screen
- Check `API_URL` in `mobile/src/services/api.ts` points to your machine's local IP (not `localhost`)
- Ensure your phone and dev machine are on the same Wi-Fi network

### AsyncStorage errors
```bash
cd mobile
expo install @react-native-async-storage/async-storage
```

---

## Docker Issues

### Services not starting
```bash
docker-compose logs backend
docker-compose logs db
```

### Database not ready / backend crashes on startup
The backend uses `depends_on` with a healthcheck. If the db container takes longer than expected:
```bash
docker-compose restart backend
```

### Port conflicts
Edit `docker-compose.yml` and change the host port (left side of `:`) for the conflicting service.

### Stale containers / volumes
```bash
docker-compose down -v   # removes volumes — ALL DATA WILL BE LOST
docker-compose up -d
```

---

## Performance Issues

### Slow API responses
- Check for missing database indexes (common on `user_id`, `date` columns)
- Enable query logging: set `SQLALCHEMY_ECHO=True` temporarily

### Frontend lag
- Run the production build: `npm run build`
- Check for unnecessary re-renders with React DevTools Profiler

### Memory issues (gunicorn)
- Reduce worker count: `-w 2` instead of `-w 4`
- Monitor with: `docker stats`

---

## Getting Help

- **GitHub Issues:** https://github.com/your-org/timeblazer-app/issues
- **Documentation:** [README.md](README.md) | [SETUP.md](SETUP.md) | [API.md](API.md)
- Include your OS, Python/Node versions, and the full error message when filing an issue.
