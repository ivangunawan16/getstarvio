# Backend — Kevin's Workspace

> **Status:** Empty placeholder. Kevin will init project here Sprint 1 (Apr 21).

## Quick Start (Apr 21 Monday)

1. Read handoff docs (in order):
   - `../docs/shared/README.md`
   - `../docs/shared/ARCHITECTURE.md`
   - `../docs/shared/DEPLOYMENT.md` (DO droplet step-by-step)
   - `../docs/shared/ENV-TEMPLATE.md`
   - `../docs/kevin/00-OVERVIEW.md`
   - `../docs/kevin/01-STACK-OPTIONS.md`
   - `../docs/kevin/02-DATABASE-SCHEMA.md`
   - `../docs/kevin/03-API-CONTRACT.md`
   - `../docs/kevin/04-META-INTEGRATION.md` (critical)
   - `../docs/kevin/05-SPRINT-CHECKLIST.md`

2. Pick stack (Meeting #1 Sunday Apr 20 20:00 WIB):
   - Node.js + Fastify + TypeScript + Prisma ⭐ (recommended)
   - Python + FastAPI + SQLAlchemy
   - Go + Gin + GORM

3. Provision DO droplet:
   ```bash
   # See ../docs/shared/DEPLOYMENT.md for step-by-step
   # - Singapore SGP1 region
   # - Ubuntu 24.04 x64
   # - $8/mo (1GB RAM)
   # - Backups enabled
   ```

4. On droplet: install Nginx, Postgres 16, Redis, SSL via Certbot

5. Init BE project + run first migration based on `../docs/kevin/02-DATABASE-SCHEMA.md`

6. Deploy `/health` endpoint → verify `https://api.getstarvio.com/health` returns 200

7. Push feature branch → PR to `staging` → review by Okta

## Schema Reference

**Source of truth:** `../prompts/00-global.md` DATA SCHEMA section.  
**Relational SQL:** `../docs/kevin/02-DATABASE-SCHEMA.md`.

## Sprint Targets

| Week | Target |
|---|---|
| Apr 21-27 | Foundation + Meta integration + 2 remaining test calls |
| Apr 28-29 | Production deploy + verify webhooks + support Meta submit |
| May 1-7 | Customer features + scheduler + Stripe billing + admin |
| May 8-10 | Beta launch with 5 users |

## Key External Services

- **DigitalOcean** (BE hosting) — $8/mo droplet SGP1
- **Meta Graph API** v21.0 — Cloud API + Business Management
- **Google OAuth** — for user authentication
- **Stripe** (Sprint 3) — payment processing
- **Sentry** (free tier) — error monitoring
- **UptimeRobot** (free) — uptime monitoring

## Meta Test Calls Pending (Sprint 1 Day 5)

1. `business_management`: `GET /me/businesses` via Graph API Explorer
2. `manage_app_solution`: `GET /{APP_ID}/subscriptions` via Graph API Explorer

Both needed before Apr 29 Meta submission.

Good luck! See `docs/kevin/05-SPRINT-CHECKLIST.md` for daily tasks.
