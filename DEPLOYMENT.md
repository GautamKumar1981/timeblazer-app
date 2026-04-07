# Timeblazer Deployment Guide

## Production Deployment

### Prerequisites

- A Linux server (Ubuntu 22.04 recommended)
- Docker and Docker Compose installed
- A domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

---

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 2. Clone and Configure

```bash
git clone https://github.com/GautamKumar1981/timeblazer-app.git
cd timeblazer-app

# Configure backend
cp backend/.env.example backend/.env
```

Edit `backend/.env` with production values:

```env
DATABASE_URL=postgresql://timeblazer_user:STRONG_PASSWORD@postgres:5432/timeblazer_db
SECRET_KEY=GENERATE_A_STRONG_RANDOM_KEY
JWT_SECRET_KEY=GENERATE_ANOTHER_STRONG_KEY
FLASK_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

Generate strong keys:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 3. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: timeblazer_db
      POSTGRES_USER: timeblazer_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - timeblazer-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://timeblazer_user:${POSTGRES_PASSWORD}@postgres:5432/timeblazer_db
      SECRET_KEY: ${SECRET_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      FLASK_ENV: production
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - postgres
    networks:
      - timeblazer-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${API_URL}
        REACT_APP_WS_URL: ${WS_URL}
    restart: always
    networks:
      - timeblazer-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - timeblazer-network

volumes:
  postgres_data:

networks:
  timeblazer-network:
    driver: bridge
```

---

## 4. Nginx Configuration

Create `nginx.conf`:

```nginx
events { worker_connections 1024; }

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
        }
    }
}
```

---

## 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

---

## 6. Deploy

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend flask db upgrade

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 7. Database Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U timeblazer_user timeblazer_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20240115.sql | docker-compose exec -T postgres psql -U timeblazer_user timeblazer_db
```

Schedule daily backups with cron:
```bash
0 2 * * * cd /path/to/timeblazer-app && docker-compose exec postgres pg_dump -U timeblazer_user timeblazer_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 8. Monitoring

```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 9. Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker-compose -f docker-compose.prod.yml exec backend flask db upgrade
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | `strong-random-password` |
| `SECRET_KEY` | Flask secret key | `64-char-hex-string` |
| `JWT_SECRET_KEY` | JWT signing key | `64-char-hex-string` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://yourdomain.com` |
| `API_URL` | Backend URL for frontend | `https://yourdomain.com` |
| `WS_URL` | WebSocket URL | `wss://yourdomain.com` |
