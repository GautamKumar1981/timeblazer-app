# Deployment Guide

## Overview

Timeblazer can be deployed as a set of Docker containers or manually on any Linux server. The backend exposes a REST/WebSocket API, the frontend is a static SPA served by Nginx, and background jobs run via Celery workers.

---

## Docker Production Deployment

1. **Prepare environment**
   ```bash
   cp backend/.env.example backend/.env
   # Set strong SECRET_KEY, JWT_SECRET_KEY, and real DB credentials in backend/.env
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   docker-compose exec backend flask db upgrade
   ```

4. **Verify services**
   ```bash
   docker-compose ps
   curl http://localhost:5000/health
   ```

---

## Manual Production Deployment

### Backend (Gunicorn + Nginx)

```bash
cd backend
source venv/bin/activate
pip install gunicorn eventlet
gunicorn -w 4 -k eventlet -b 0.0.0.0:5000 "app.main:create_app()"
```

**Nginx reverse proxy config:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Set `FLASK_ENV=production` and use a production-grade PostgreSQL connection pool (e.g., PgBouncer).

### Frontend (Nginx)

```bash
cd frontend
npm run build
# Copy build/ to Nginx web root
sudo cp -r build/* /var/www/html/
```

Configure Nginx to serve `index.html` for all routes (SPA fallback) and enable HTTPS via Certbot.

---

## Cloud Deployment

### Heroku
```bash
heroku create timeblazer-api
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git subtree push --prefix backend heroku main
heroku run flask db upgrade
```

### DigitalOcean App Platform
- Create a new App, connect your GitHub repo
- Add backend as a Web Service (Python), frontend as a Static Site
- Add a PostgreSQL and Redis managed database
- Set environment variables in the App dashboard

### AWS (ECS + RDS)
- Push Docker images to ECR
- Create ECS task definitions for backend and celery
- Use RDS PostgreSQL and ElastiCache Redis
- Use ALB for routing

---

## Security Checklist

- [ ] Strong, random `SECRET_KEY` and `JWT_SECRET_KEY` (32+ chars)
- [ ] HTTPS enabled on all public endpoints
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on auth endpoints
- [ ] Database credentials stored in environment variables, not code
- [ ] PostgreSQL not exposed to the public internet
- [ ] Redis protected with a password or bound to localhost
- [ ] Regular database backups configured
- [ ] Dependency versions pinned and audited
