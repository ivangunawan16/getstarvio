# Deployment Runbook — DigitalOcean + Vercel

> **Target:** Live app di `getstarvio.com` + `api.getstarvio.com` by **27 April** untuk Meta review submission buffer.

## Prerequisites

- Domain `getstarvio.com` already owned (verify access to DNS at registrar)
- DigitalOcean account (Sebastian provide billing details)
- Vercel account (free tier, use company email)
- Meta Developer account + App already created (Sebastian provide App ID)
- Google Cloud Console access (untuk OAuth credentials)

## Phase 1: DigitalOcean Droplet Setup (Kevin)

### 1.1 Create Droplet

1. Log in ke DO Console
2. Create → Droplets
3. Image: **Ubuntu 24.04 (LTS) x64**
4. Region: **Singapore (SGP1)** — closest to Indonesia
5. Size: **Basic → Regular SSD → $8/mo** (1GB RAM, 1 vCPU, 25GB SSD)
6. Authentication: **SSH key** (upload public key, tidak pakai password)
7. Hostname: `getstarvio-api-prod`
8. Enable: **Backups** ($1.60/mo, weekly snapshot — wajib!)
9. Create Droplet

**Cost:** ~$9.60/mo = ~Rp 160rb

### 1.2 Initial Server Setup

SSH ke droplet:
```bash
ssh root@<droplet_ip>
```

Run:
```bash
# Update
apt update && apt upgrade -y

# Create deploy user (jangan deploy as root)
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# UFW firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# Disable password auth, root SSH
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh

# Fail2ban
apt install -y fail2ban
systemctl enable --now fail2ban
```

### 1.3 Install Core Services

As `deploy` user:
```bash
# Nginx
sudo apt install -y nginx

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser deploy --createdb --login
sudo -u postgres psql -c "ALTER USER deploy WITH PASSWORD '<strong-random-password>';"
createdb getstarvio_prod
createdb getstarvio_staging

# Redis
sudo apt install -y redis-server
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sudo systemctl restart redis

# Node.js 20 (kalau pakai Node)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# OR Python 3.12 (kalau pakai Python)
sudo apt install -y python3.12 python3.12-venv python3-pip

# PM2 (process manager)
sudo npm install -g pm2

# Certbot (Let's Encrypt SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.4 DNS Configuration

At domain registrar (GoDaddy / Niagahoster / Cloudflare / wherever `getstarvio.com` registered):

```
A     getstarvio.com            76.76.21.21              (Vercel — get from Vercel setup)
A     www.getstarvio.com        76.76.21.21
A     api.getstarvio.com        <droplet_ip>             (DO droplet)
A     *.getstarvio.com          <droplet_ip>             (untuk admin random subdomain)
```

Wait 10-60 min untuk DNS propagation.

### 1.5 Nginx Config for Backend

```bash
sudo nano /etc/nginx/sites-available/api.getstarvio.com
```

```nginx
server {
    listen 80;
    server_name api.getstarvio.com;

    # Redirect non-SSL to SSL (after Certbot sets this up)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.getstarvio.com;

    # SSL certs managed by Certbot

    # Request size limits
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;

    # Backend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;    # app port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Rate limit for webhook endpoint (Meta bursts up to 50/s)
    location /webhooks/meta {
        limit_req zone=webhook burst=100 nodelay;
        proxy_pass http://127.0.0.1:3000/webhooks/meta;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Rate limit zone (add to http{} in main nginx.conf)
# limit_req_zone $binary_remote_addr zone=webhook:10m rate=50r/s;
```

Enable + SSL:
```bash
sudo ln -s /etc/nginx/sites-available/api.getstarvio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.getstarvio.com
```

### 1.6 App Deploy (Kevin's backend)

```bash
cd /home/deploy
git clone https://github.com/sebastian-getstarvio/getstarvio.git
cd getstarvio/backend
# Install deps (npm install / pip install / go mod download)
# Setup .env (see ENV-TEMPLATE.md)
# Run migrations
# Start via PM2:
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # run as sudo
```

## Phase 2: Vercel Frontend Setup (Okta)

### 2.1 Vercel Project

1. Log in ke Vercel dengan GitHub
2. Import Git Repository → pilih `getstarvio` repo
3. Framework: auto-detect (Next.js / Vite / Nuxt)
4. Root Directory: `frontend/`
5. Build Command: `npm run build` (or yarn/pnpm equivalent)
6. Output Directory: auto (`.next` / `dist` / `.output`)
7. Environment Variables: see ENV-TEMPLATE.md
8. Deploy

### 2.2 Custom Domain

In Vercel project → Settings → Domains:
- Add `getstarvio.com`
- Add `www.getstarvio.com` → redirect to apex
- Vercel akan kasih DNS A record untuk di-add di registrar
- Wait DNS propagation

### 2.3 Staging Deployment

Vercel auto-deploy every git push:
- `main` branch → production (getstarvio.com)
- `staging` branch → preview URL (staging.getstarvio.com)
- feature branches → unique preview URLs

## Phase 3: Google OAuth Setup (both, shared)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `getstarvio`
3. APIs & Services → OAuth consent screen
   - User Type: External
   - App name: getstarvio
   - Support email + Dev contact: admin@getstarvio.com
   - Scopes: `email`, `profile`, `openid`
   - Test users (dev phase): email tim + Sebastian's email
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Type: Web application
   - Authorized JavaScript origins:
     - `https://getstarvio.com`
     - `http://localhost:3000` (dev)
   - Authorized redirect URIs:
     - `https://getstarvio.com/auth/google/callback`
     - `http://localhost:3000/auth/google/callback`
5. Copy `Client ID` + `Client Secret` → simpan ke both FE & BE env vars

## Phase 4: Meta Webhook Setup (Kevin)

1. Meta App Dashboard → WhatsApp → Configuration
2. Webhook callback URL: `https://api.getstarvio.com/webhooks/meta`
3. Verify token: generate random string 32+ chars, save to BE `.env` as `META_WEBHOOK_VERIFY_TOKEN`
4. Click Verify and Save
5. Subscribe to fields:
   - ✅ messages
   - ✅ message_template_status_update
   - ✅ account_update
   - ✅ history (untuk Coexistence)
   - ✅ smb_app_state_sync (untuk Coexistence)
   - ✅ smb_message_echoes (untuk Coexistence)

## Phase 5: Monitoring (minimum viable)

### DO Monitoring (free)
- Enable di Droplet settings → Monitoring
- Alert: CPU > 80% for 5min, disk > 80%, memory > 90%
- Alert email: admin@getstarvio.com

### App Logs
- PM2: `pm2 logs` (tail realtime)
- Nginx: `/var/log/nginx/api.access.log`
- App errors: ship ke Sentry (free tier 5k events/mo)

### Uptime Check
- UptimeRobot (free) — ping `https://api.getstarvio.com/health` every 5min
- Alert via WA group webhook kalau down

## Deployment Checklist

Before going live:

- [ ] DO droplet created + firewall configured
- [ ] Nginx + SSL (Let's Encrypt) working untuk api.getstarvio.com
- [ ] PostgreSQL + Redis installed + running
- [ ] DNS pointing correctly (A records for apex + api)
- [ ] Vercel deployed `main` branch
- [ ] Google OAuth configured + tested (can login)
- [ ] Meta webhook verified (test from Meta dashboard)
- [ ] PM2 auto-restart on reboot
- [ ] Backups enabled (DO weekly + daily pg_dump)
- [ ] Monitoring + uptime alert setup
- [ ] Sentry connected (error tracking)
- [ ] `.env` files secured (not in git, use `.env.example` as template)

## Rollback Plan

Production issue?

1. Vercel: rollback instantly via dashboard → Deployments → pick previous → Promote
2. Backend: `pm2 reload getstarvio --update-env` to restart with previous git commit
3. Database: restore from daily pg_dump (lokasi: `/home/deploy/backups/` or DO Spaces)
4. Droplet: restore from DO weekly snapshot (worst case, 15min downtime)

## Domain Mapping Final

| Subdomain | Purpose | Points to |
|---|---|---|
| `getstarvio.com` | Frontend | Vercel |
| `www.getstarvio.com` | Redirect | Vercel (→ apex) |
| `api.getstarvio.com` | Backend REST API | DO droplet |
| `<random32char>.getstarvio.com` | Admin panel | Same droplet (nginx route to /admin) — decided later |

Random admin subdomain generation:
```bash
# Generate 32-char alphanumeric (Kevin runs this, set di nginx config)
openssl rand -hex 16
# e.g. "a7c9e2f5b3d8a1c4e6b9f2d5a8c1e4f7"
# → admin URL: https://a7c9e2f5b3d8a1c4e6b9f2d5a8c1e4f7.getstarvio.com
```
