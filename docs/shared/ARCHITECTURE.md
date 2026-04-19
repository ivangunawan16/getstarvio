# Architecture — getstarvio Production App

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    CUSTOMER (UMKM Owner)                        │
│          Salon / Spa / Klinik / Barbershop / dll               │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND (Vercel / DO droplet)                                 │
│  Domain: getstarvio.com                                          │
│  Tech: Dev's choice (Next.js / Vite+React / Nuxt)               │
│  Responsibility:                                                 │
│   • Authentication UI (Google OAuth button)                      │
│   • Embedded Signup (Facebook JS SDK integration)                │
│   • Admin dashboard UI (pages dari mockup)                       │
│   • Template management UI                                       │
│   • Customer + reminder management UI                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTPS, JWT auth)
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  BACKEND (DigitalOcean Droplet — SGP1 Jakarta)                  │
│  Domain: api.getstarvio.com                                      │
│  Tech: Dev's choice (Node.js / Python / Go)                     │
│  Runs: Nginx reverse proxy + App server + PostgreSQL + Redis    │
│  Responsibility:                                                 │
│   • Auth (Google OAuth validation, session/JWT)                  │
│   • Meta Graph API integration (proxy calls)                     │
│   • Webhook receiver from Meta                                   │
│   • Database CRUD (users, customers, reminders, etc.)            │
│   • Scheduler (send reminders at scheduled times)                │
│   • Audit log                                                    │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (OAuth 2.0, Graph API)
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  META CLOUD API (external)                                       │
│  graph.facebook.com / v21.0                                      │
│   • Token exchange                                               │
│   • Template CRUD                                                │
│   • Send messages                                                │
│   • Phone number management                                      │
│   • Business portfolio data                                      │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ Webhook (HTTPS POST to api.getstarvio.com)
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  BACKEND Webhook Handler                                         │
│  Endpoint: POST api.getstarvio.com/webhooks/meta                │
│  Events:                                                         │
│   • messages (delivery status, incoming)                         │
│   • message_template_status_update                               │
│   • account_update                                               │
│   • smb_app_state_sync (Coexistence)                            │
│   • smb_message_echoes (Coexistence)                            │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. New Customer Onboarding (Embedded Signup)
```
Owner clicks "Hubungkan WhatsApp Business"
  ↓
FE: FB.login() with scopes + extras (sessionInfoVersion:3, featureType:whatsapp_business_app_onboarding)
  ↓
FB popup opens → Owner login → Select WABA → Scan QR
  ↓
FE receives message event: { waba_id, phone_number_id, business_id, authResponse.code }
  ↓
FE POST /api/meta/onboard { code, waba_id, phone_number_id, business_id }
  ↓
BE: Exchange code → long-lived access token via graph.facebook.com/v21.0/oauth/access_token
  ↓
BE: Store encrypted token + ids in database (users.meta JSONB field)
  ↓
BE: Fetch /phone_number_id/, /waba_id/, /business_id/ details from Meta
  ↓
BE: Register webhook subscription untuk WABA
  ↓
BE: Return connection details to FE
  ↓
FE: Display success state with verified_name + phone + quality rating
```

### 2. Send Aftercare Reminder
```
Scheduler (cron/queue) finds due reminders every minute
  ↓
BE: For each reminder, call POST /{phone_number_id}/messages via Meta API
  ↓
BE: Log reminder status = 'pending' with message_id returned
  ↓
Meta delivers to customer WhatsApp
  ↓
Meta sends webhook: POST /webhooks/meta { status: 'delivered' } (or 'failed')
  ↓
BE: Update reminder.status = 'terkirim' + sentAt = now
  ↓
FE (next load): See updated status in Log Pengingat
```

### 3. Template Submission to Meta
```
Admin fills template form di FE → clicks "Submit ke Meta"
  ↓
FE POST /api/templates { name, category, language, body, example }
  ↓
BE: Call POST /{WABA_ID}/message_templates with Meta's JSON format
  ↓
Meta returns { id, status: 'PENDING' }
  ↓
BE: Store template in DB with meta_template_id + status
  ↓
... (hours later, Meta reviews)
  ↓
Meta sends webhook: message_template_status_update with new status (APPROVED/REJECTED)
  ↓
BE: Update templates.status in DB
  ↓
FE (next load): See updated status in admin Templates tab
```

## Security Boundaries

| Data | Storage | Encryption | Who Can Access |
|---|---|---|---|
| Google OAuth tokens | Backend DB | AES-256 | Backend only, never FE |
| Meta access_token | Backend DB | AES-256 (KMS envelope) | Backend only, never FE |
| User passwords | N/A | — | Using OAuth only, no passwords |
| waba_id / phone_number_id / business_id | Backend DB | Plain | FE gets via API (IDs not secret) |
| Session JWT | FE localStorage / httpOnly cookie | Signed | FE for auth header |
| Customer WA numbers | Backend DB | Plain (stored as 628xxx format) | FE gets via API per-user |

**CRITICAL:** Access tokens NEVER travel to frontend or get stored in browser. Backend always acts as proxy.

## Deployment Topology

### Development Phase (current — $8/mo total infra)
```
Vercel (FREE)           DigitalOcean Droplet ($6-12/mo)
────────────            ─────────────────────────────
getstarvio.com          api.getstarvio.com
Next.js / Vite          Nginx → App → Postgres → Redis
Build on push           All-in-one droplet (1GB RAM)
```

### Scale Phase (post-100 customers, ~$50/mo)
```
Vercel (FREE)           DO Droplet (4GB $24/mo)         DO Managed ($15/mo)
────────────            ──────────────────────          ───────────────────
getstarvio.com          api.getstarvio.com              Managed Postgres
                        App server only                  (auto-backup, failover)
                        + DO Managed Redis ($15/mo)
```

## Key Constraints

1. **1GB RAM droplet** — hati-hati dengan memory leak, streaming large responses, log retention
2. **SGP1 region** — Meta webhook latency ~30-80ms ok, Jakarta customer ~10-20ms
3. **Indonesia data residency** — UU PDP: data user di Jakarta atau Singapore max (jangan US/EU)
4. **No auto-scaling di dev phase** — monitor manual, scale up droplet kalau butuh
5. **Backup strategy** — DO weekly snapshot ($1/mo enable it) + daily pg_dump ke DO Spaces (optional $5/mo)

## Tech Decisions Already Made

- ✅ **Monorepo** (frontend/ + backend/ in same repo)
- ✅ **DigitalOcean SGP1** droplet for backend
- ✅ **Vercel free tier** for frontend (or fallback to droplet)
- ✅ **PostgreSQL** database
- ✅ **E2E tests wajib** untuk critical flows

## Tech Decisions Left to Devs

- Frontend framework (Next.js / Vite+React / Nuxt)
- Backend language (Node.js / Python / Go)
- ORM (Prisma / Drizzle / SQLAlchemy / GORM / etc.)
- Queue strategy (BullMQ / node-cron / SQS / custom)
- Test framework (Playwright / Cypress / Vitest / Jest)

Baca `01-STACK-OPTIONS.md` di folder masing-masing untuk rekomendasi.
