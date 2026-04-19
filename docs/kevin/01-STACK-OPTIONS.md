# Backend Stack Options

**Tidak ada pilihan "benar"** — semua 3 OK. Pilih yang paling kamu produktif dan fit DO $8/mo (1GB RAM) constraint.

## Decision Matrix

| Factor | Node.js (Fastify) | Python (FastAPI) | Go (Gin/Fiber) |
|---|---|---|---|
| Language maturity | ✅ Huge ecosystem | ✅ Huge ecosystem | ✅ Modern + growing |
| Memory footprint (1GB RAM) | Medium (~100-200MB idle) | Medium (~80-150MB idle) | Low (~20-50MB idle) |
| Startup time | Fast (~1s) | Medium (~2s) | Fastest (~100ms) |
| Concurrency model | Single-thread event loop | Async (asyncio) | Goroutines |
| TypeScript-like safety | ✅ With TS | ⚠️ mypy (optional) | ✅ Built-in types |
| ORM quality | Prisma ⭐ / Drizzle | SQLAlchemy ⭐ | GORM / sqlc |
| Meta SDK support | Official Facebook SDK | Community libs | Manual HTTP |
| Webhook signature verify | Easy (crypto native) | Easy (hashlib) | Easy (crypto/hmac) |
| Cron/scheduler | node-cron / BullMQ | Celery / APScheduler | gocron |
| Testing frameworks | Vitest / Jest | pytest | testing + testify |
| Dev experience | Very fast HMR | Fast reload | Fast compile |
| Deploy complexity | PM2 easy | systemd / gunicorn | systemd binary |

## Recommended: **Node.js + Fastify + TypeScript + Prisma**

Why:
- **Same language as FE** (Okta pakai TS) → types shared via monorepo
- **Fastify** lightweight (100MB footprint OK untuk 1GB droplet)
- **Prisma** type-safe ORM, schema-first, migration auto-gen
- **BullMQ** (Redis) untuk background jobs (reminder scheduler)
- Huge ecosystem, banyak reference untuk Meta integration

Base setup:
```bash
cd backend
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie @fastify/helmet
npm install -D typescript tsx @types/node
npm install prisma @prisma/client
npm install ioredis bullmq
npm install axios
npm install -D vitest @vitest/coverage-v8

# Setup Prisma
npx prisma init
```

Sample `package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "generate": "prisma generate",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Project structure
```
backend/
├── src/
│   ├── index.ts                    (entry: server + plugins)
│   ├── config/
│   │   ├── env.ts                  (parse + validate .env)
│   │   └── server.ts               (fastify setup)
│   ├── routes/
│   │   ├── auth.ts                 (Google OAuth + session)
│   │   ├── me.ts                   (current user)
│   │   ├── meta.ts                 (Embedded Signup, connection)
│   │   ├── customers.ts
│   │   ├── categories.ts
│   │   ├── templates.ts
│   │   ├── reminders.ts
│   │   ├── billing.ts
│   │   ├── admin.ts
│   │   ├── public.ts               (checkin public page)
│   │   └── webhooks/
│   │       └── meta.ts             (Meta webhook handler)
│   ├── services/
│   │   ├── meta-api.ts             (Graph API client wrapper)
│   │   ├── google-oauth.ts
│   │   ├── encryption.ts           (AES-256 for tokens)
│   │   ├── scheduler.ts            (BullMQ reminder scheduler)
│   │   └── stripe.ts               (billing — Phase 2)
│   ├── lib/
│   │   ├── db.ts                   (Prisma client)
│   │   ├── redis.ts
│   │   ├── logger.ts               (pino)
│   │   └── errors.ts               (error classes)
│   ├── middleware/
│   │   ├── auth.ts                 (JWT verify)
│   │   ├── admin.ts                (admin-only gate)
│   │   └── rate-limit.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   └── *.test.ts
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── ecosystem.config.js             (PM2 config)
```

### Essential npm packages
```json
{
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/jwt": "^9.0.0",
    "@fastify/cookie": "^11.0.0",
    "@fastify/helmet": "^13.0.0",
    "@fastify/rate-limit": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "bcrypt": "^5.1.0",
    "ioredis": "^5.3.0",
    "bullmq": "^5.0.0",
    "pino": "^9.0.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

## Alternative 1: Python + FastAPI + SQLAlchemy

Why pilih:
- Kalau tim strong Python
- Excellent async (uvloop bisa outperform Node in some benchmarks)
- FastAPI auto-generate OpenAPI spec (bagus buat sharing ke Okta)

Base setup:
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn[standard] sqlalchemy alembic asyncpg psycopg2-binary
pip install pydantic pydantic-settings
pip install httpx  # untuk Meta API calls
pip install redis
pip install celery  # untuk scheduler
pip install pytest pytest-asyncio
pip freeze > requirements.txt
```

### Project structure
```
backend/
├── app/
│   ├── main.py                     (FastAPI entry)
│   ├── config.py                   (Settings via pydantic)
│   ├── routers/
│   │   ├── auth.py
│   │   ├── meta.py
│   │   ├── customers.py
│   │   └── ...
│   ├── services/
│   │   ├── meta_api.py
│   │   └── ...
│   ├── models/                     (SQLAlchemy models)
│   ├── schemas/                    (Pydantic schemas)
│   ├── db.py
│   └── dependencies.py
├── alembic/
├── tests/
├── .env
└── requirements.txt
```

### Essential deps
```
fastapi==0.115.0
uvicorn[standard]==0.34.0
sqlalchemy==2.0.0
alembic==1.13.0
asyncpg==0.29.0
pydantic==2.8.0
pydantic-settings==2.4.0
httpx==0.27.0
redis==5.2.0
celery==5.4.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
```

Deployment: gunicorn + Uvicorn workers:
```bash
gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:3000
```

## Alternative 2: Go + Gin + GORM

Why pilih:
- Paling efficient di 1GB RAM (binary ~20MB, runtime ~50MB)
- Compiled binary — zero runtime deps
- Fastest cold start
- Very strong concurrency (goroutines)

Base setup:
```bash
cd backend
go mod init github.com/getstarvio/backend
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm gorm.io/driver/postgres
go get -u github.com/go-redis/redis/v9
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/joho/godotenv
```

### Project structure
```
backend/
├── cmd/
│   └── server/
│       └── main.go                 (entry)
├── internal/
│   ├── auth/
│   ├── meta/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   └── services/
├── pkg/
│   └── logger/
├── migrations/
├── tests/
├── go.mod
└── go.sum
```

Deployment: binary + systemd service — cara Go paling bagus.

## Stack-Agnostic Requirements

Regardless of language, you MUST:

### Security
- HMAC SHA-256 verification on all webhooks
- AES-256-GCM encryption untuk access tokens at rest
- bcrypt for any stored passwords (if any)
- JWT signed dengan HS256 minimum (RS256 better)
- HTTPS enforced (via Nginx)
- CORS whitelist `getstarvio.com` origin
- Rate limiting 100 req/min per IP default, 50 req/s for webhook endpoint
- Helmet-equivalent security headers

### Observability
- Structured logging (JSON format) — includes `request_id`, `user_id`
- Health endpoint `GET /health` — return 200 OK + version + uptime
- Metrics endpoint (optional Prometheus-compat) atau Sentry for errors
- Request logging with sampling (don't log all, too expensive)

### Error Handling
- Consistent error response shape:
  ```json
  {
    "error": true,
    "code": "META_API_ERROR",
    "message": "User-facing message in Indonesian",
    "details": {}
  }
  ```
- Never leak stack traces ke production response
- Log full trace to Sentry

### Testing
- Unit tests untuk business logic
- Integration tests untuk API endpoints (hit real DB + Redis)
- E2E test minimum untuk critical flow:
  - Login → `GET /me`
  - Embedded Signup exchange → saved in DB
  - Template submit → Meta API called → stored
  - Webhook received → template status updated

### Database Migrations
- Version-controlled migrations (Prisma Migrate / Alembic / Go migrate)
- Never `ALTER TABLE` directly in production
- Test migrations on staging first
- Backup before major migration

### Queue / Scheduler
- For reminder scheduler: cron job every minute → find due → enqueue → worker sends
- BullMQ (Node) / Celery (Python) / gocron (Go) — choose one

## DO Droplet $8 Considerations

### Memory budget (1GB total)
```
System (Ubuntu):     ~150MB
Nginx:               ~20MB
PostgreSQL:          ~150-250MB (tune shared_buffers to 128MB)
Redis:               ~20-50MB
Backend app:         ~100-300MB (depends on language)
Buffer/cache:        ~200MB
─────────────────────────
Total usable:        ~800-900MB
Headroom:            ~100-200MB
```

**Tips untuk stay under 1GB:**
- PostgreSQL: `shared_buffers = 128MB`, `work_mem = 4MB`, `max_connections = 25`
- Redis: `maxmemory 64mb`, `maxmemory-policy allkeys-lru`
- App: limit connection pool size 10-15
- Log rotation mandatory (logrotate)
- Disable unused services (snap, apt daily)

### Disk budget (25GB total)
```
OS + installed tools:  ~5GB
PostgreSQL data:       ~1-5GB (dev phase)
Logs (rotated):        ~500MB
Backups (local):       ~2GB
App + deps:            ~500MB
Redis dump:            ~100MB
Free buffer:           ~10GB+
```

### Network (1TB/month transfer)
- Inbound API requests: minimal
- Outbound to Meta: moderate (each send ~1KB)
- With 1K customers × 30 reminders/month × 10KB = 300MB — trivial
- Should not hit limit in dev phase

## Decision Point

**Pick 1 stack by Monday Apr 20 20:00 WIB Meeting #1.**

Kriteria:
1. **Fluency** — yang paling nyaman kamu debug di 3 AM
2. **Memory efficiency** — constraint 1GB droplet
3. **Ecosystem** — Meta integration libs available

Commit decision di Meeting #1 + post di WA group.

## Database Choice: PostgreSQL (non-negotiable)

Alasan:
- JSONB for `meta` object di users table (flexible)
- Relational for everything else
- Widely supported oleh semua stack
- DO droplet can self-host (no extra cost)

Version: PostgreSQL 16 (latest stable as of Apr 2026).

## Next Steps

After pick stack:

1. Monday Apr 21 morning:
   - Create DO droplet
   - Setup Nginx + SSL for api.getstarvio.com
   - Install Postgres + Redis
   - Init project with chosen stack
   - Define schema per `02-DATABASE-SCHEMA.md`
   - Run first migration
   - Health endpoint live

2. Tuesday Apr 22:
   - Google OAuth endpoint
   - JWT generation
   - User CRUD basic

3. Wednesday Apr 23 (Meeting #2 day):
   - Meta code exchange endpoint
   - User.meta storage

Read `04-META-INTEGRATION.md` next untuk detail Meta API integration.
