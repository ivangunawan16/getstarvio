# Environment Variables Template

> **Security:** NEVER commit `.env` files. Add `.env*` to `.gitignore`. Share values via WA encrypted message or 1Password. This file is a template only.

## Frontend `.env` (Okta)

Lokasi: `frontend/.env.local` (untuk Next.js) / `frontend/.env` (Vite) / `frontend/.env` (Nuxt)

```bash
# ═══════════════════════════════════════════
# PUBLIC (exposed to browser — prefix with NEXT_PUBLIC_ / VITE_ / NUXT_PUBLIC_)
# ═══════════════════════════════════════════

# Backend API base URL
NEXT_PUBLIC_API_URL=https://api.getstarvio.com
# dev: http://localhost:3001

# Meta App ID (safe to expose)
NEXT_PUBLIC_META_APP_ID=2020424788827939
NEXT_PUBLIC_META_API_VERSION=v21.0
NEXT_PUBLIC_META_CONFIG_ID=<get from Meta App Dashboard → Embedded Signup Configuration>

# Google OAuth Client ID (safe to expose)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<from-google-cloud-console>.apps.googleusercontent.com

# Sentry DSN (optional, safe to expose)
NEXT_PUBLIC_SENTRY_DSN=

# Environment flag
NEXT_PUBLIC_ENV=production
# dev: development
# staging: staging
```

## Backend `.env` (Kevin)

Lokasi: `backend/.env` (Node) / `backend/.env` (Python FastAPI) / `backend/config/.env` (Go)

```bash
# ═══════════════════════════════════════════
# SERVER CONFIG
# ═══════════════════════════════════════════

PORT=3000
NODE_ENV=production
# dev: development
# staging: staging

APP_URL=https://api.getstarvio.com
FRONTEND_URL=https://getstarvio.com
CORS_ORIGINS=https://getstarvio.com,https://www.getstarvio.com

# ═══════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════

DATABASE_URL=postgresql://deploy:<password>@localhost:5432/getstarvio_prod
# dev: postgresql://localhost:5432/getstarvio_dev

# ═══════════════════════════════════════════
# REDIS (for job queue + session cache)
# ═══════════════════════════════════════════

REDIS_URL=redis://localhost:6379/0
# dev: redis://localhost:6379/1

# ═══════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════

# Google OAuth (SECRET — do not expose)
GOOGLE_CLIENT_ID=<from-google-cloud-console>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
GOOGLE_REDIRECT_URI=https://getstarvio.com/auth/google/callback

# JWT signing
JWT_SECRET=<generate-random-64-char-string>
JWT_EXPIRES_IN=7d

# Session cookie
COOKIE_DOMAIN=.getstarvio.com
COOKIE_SECRET=<generate-random-32-char-string>

# ═══════════════════════════════════════════
# META WHATSAPP (SECRETS)
# ═══════════════════════════════════════════

META_APP_ID=2020424788827939
META_APP_SECRET=<from-meta-app-dashboard-settings>
META_API_VERSION=v21.0
META_WEBHOOK_VERIFY_TOKEN=<generate-random-32-char-string>
META_SYSTEM_USER_TOKEN=<permanent-token-from-system-user>

# ═══════════════════════════════════════════
# ENCRYPTION
# ═══════════════════════════════════════════

# For encrypting access tokens at rest (AES-256-GCM)
ENCRYPTION_KEY=<generate-random-32-byte-base64>
# Generate: `openssl rand -base64 32`

# ═══════════════════════════════════════════
# ADMIN ACCESS
# ═══════════════════════════════════════════

# Random 32-char subdomain for admin panel
ADMIN_SUBDOMAIN=<32-char-random>
# Generate: `openssl rand -hex 16`

# Hardcoded admin emails (only these can access admin)
ADMIN_EMAILS=admin@getstarvio.com,sebastian@getstarvio.com

# Hardcoded admin password gate (for Meta reviewer access)
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-password>
# Generate: `node -e "console.log(require('bcrypt').hashSync('yourpassword', 10))"`

# ═══════════════════════════════════════════
# STRIPE (Phase 2 — Sprint 3 onwards)
# ═══════════════════════════════════════════

STRIPE_SECRET_KEY=sk_live_<your-key>
# dev: sk_test_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-key>
STRIPE_PRICE_ID_SUBSCRIPTION=price_<id>
STRIPE_PRICE_ID_TOPUP_200=price_<id>
STRIPE_PRICE_ID_TOPUP_500=price_<id>
STRIPE_PRICE_ID_TOPUP_1000=price_<id>

# ═══════════════════════════════════════════
# MONITORING
# ═══════════════════════════════════════════

SENTRY_DSN=<from-sentry-project>
LOG_LEVEL=info
# dev: debug

# ═══════════════════════════════════════════
# FILE STORAGE (biz logos, etc.)
# ═══════════════════════════════════════════

# Option 1: DO Spaces ($5/mo — S3-compatible)
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_KEY=<your-key>
DO_SPACES_SECRET=<your-secret>
DO_SPACES_BUCKET=getstarvio-prod

# Option 2: Local filesystem (cheaper, OK for dev)
UPLOAD_DIR=/home/deploy/uploads
UPLOAD_MAX_SIZE_MB=2
```

## Critical Secrets Management

**Jangan commit ini ke Git:**
- `GOOGLE_CLIENT_SECRET`
- `META_APP_SECRET`
- `META_SYSTEM_USER_TOKEN`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `COOKIE_SECRET`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `DO_SPACES_SECRET`
- Any database password

**Store di:**
- Dev: local `.env` file (gitignored)
- Vercel: Project Settings → Environment Variables
- DO droplet: `/home/deploy/getstarvio/backend/.env` (chmod 600, owned by deploy user)

**Rotate schedule:**
- `JWT_SECRET`: every 6 months
- `META_SYSTEM_USER_TOKEN`: when Meta forces rotation
- `COOKIE_SECRET`: every 6 months
- Database password: every 12 months
- `GOOGLE_CLIENT_SECRET`: if exposed

## Generate Random Values

```bash
# 32-char random (hex)
openssl rand -hex 16

# 64-char random (hex)
openssl rand -hex 32

# Base64-encoded 32-byte
openssl rand -base64 32

# UUID v4
uuidgen

# Bcrypt hash (Node)
node -e "console.log(require('bcrypt').hashSync('password', 10))"
```

## Validation on Startup

Backend app harus validate all required env vars on startup dan fail-fast kalau missing. Example check (pseudo-code):

```
required_vars = [
  'DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'META_APP_ID', 'META_APP_SECRET', 'META_WEBHOOK_VERIFY_TOKEN'
]
for var in required_vars:
  if not env[var]:
    exit(1, f"Missing required env: {var}")
```

## Environment Config per Stage

| Stage | Branch | Frontend URL | Backend URL | Database | Meta App |
|---|---|---|---|---|---|
| Production | `main` | `getstarvio.com` | `api.getstarvio.com` | `getstarvio_prod` | Production App |
| Staging | `staging` | `<vercel-preview>.vercel.app` | `staging-api.getstarvio.com` or same prod | `getstarvio_staging` | Same production (careful!) |
| Development | `feature/*` | `localhost:3000` | `localhost:3001` | `getstarvio_dev` | Development mode (test number) |

**Penting:** Meta hanya 1 App per project — tidak ada "staging app" terpisah. Jadi staging backend bisa share Meta app dengan production. Hati-hati: staging test call jangan trigger ke real customer phones.
