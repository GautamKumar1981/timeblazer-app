# Deployment Guide

## Production Deployment with Docker Compose

### 1. Clone and Configure

```bash
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app
```

### 2. Set Production Environment Variables

Create a `.env` file in the project root:

```bash
SECRET_KEY=<generate-strong-random-key>
JWT_SECRET_KEY=<generate-strong-random-key>
POSTGRES_PASSWORD=<strong-password>
```

Generate secure keys:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Update docker-compose.yml for Production

Replace environment variables with your `.env` references and ensure:
- `FLASK_ENV=production`
- Strong passwords on all services
- HTTPS is configured (use a reverse proxy like nginx)

### 4. Build and Start

```bash
docker-compose up -d --build
```

### 5. Initialize the Database

```bash
docker-compose exec backend flask db upgrade
```

## Nginx Reverse Proxy (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

## Health Checks

- Backend: `GET http://localhost:5000/api/health`
- Frontend: `GET http://localhost:3000`
- Database: `docker-compose exec db pg_isready`

## Backup

```bash
# Backup database
docker-compose exec db pg_dump -U timeblazer_user timeblazer_db > backup.sql

# Restore database
docker-compose exec -T db psql -U timeblazer_user timeblazer_db < backup.sql
```

## Monitoring

View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Scaling

To scale the backend:
```bash
docker-compose up -d --scale backend=3
```
