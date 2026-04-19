# Kevin — Backend Overview

Halo Kevin! Welcome to getstarvio. Dokumen ini overview tugas kamu untuk 4 minggu ke depan.

## Project in 1 Paragraph

getstarvio adalah WhatsApp SaaS untuk UMKM Indonesia (salon, spa, klinik) yang kirim pengingat otomatis via WhatsApp Business Platform Cloud API. Kita registered sebagai **Meta Tech Provider** — artinya kita onboard customer WABA (WhatsApp Business Account) via Embedded Signup, kelola templates mereka, dan kirim pesan atas nama mereka. Tugas kamu: bikin backend yang (a) integrate dengan Meta Graph API, (b) handle webhooks dari Meta, (c) serve API untuk frontend (Okta), (d) schedule + send reminders, dan (e) deploy ke DigitalOcean droplet Singapore.

## Hard Deadlines

- **29 April 23:59 WIB** — Meta App Review submission (butuh BE live + 2 remaining test calls done)
- **10 Mei 2026** — Beta launch dengan 5 paid users
- **Meeting:** Senin + Kamis 20:00 WIB via WA video

## Your Responsibilities

### Sprint 1 (Apr 21–27) — Foundation + Meta Integration
1. Setup DO droplet (1GB SGP1) + install Postgres, Redis, Nginx, SSL
2. Setup BE project (language pilih sendiri, lihat `01-STACK-OPTIONS.md`)
3. Design + migrate database schema
4. Build critical endpoints untuk Meta review:
   - Google OAuth + session
   - Meta Embedded Signup code exchange
   - Template CRUD (proxy to Meta)
   - Send message (proxy to Meta)
   - Webhook receiver + dispatcher
5. **Complete 2 remaining Meta API test calls** (business_management + manage_app_solution)

### Sprint 2 (Apr 28–29) — Deploy + Submit
1. Production deploy ke DO droplet
2. Verify Meta webhook working at production URL
3. Support Okta for final E2E
4. Sebastian submit Meta review

### Sprint 3 (May 1–7) — Production Features
1. Customer CRUD + CSV import
2. Reminder scheduler (cron job)
3. Multi-tenant data isolation
4. Billing endpoints (Stripe)
5. Audit log + impersonate
6. Data deletion endpoint (GDPR/UU PDP)

### Sprint 4 (May 8–10) — Launch
1. Performance tuning
2. Monitor + fix beta issues
3. Support beta onboarding

## Your Sources of Truth

In priority order:

1. **`prompts/00-global.md`** — Schema, business rules, billing model. **THIS IS LAW.**
2. **`prompts/META-APP-REVIEW.md`** — Compliance requirements + API calls expected
3. **`docs/kevin/*.md`** — Technical guidance khusus kamu
4. **`prompts/09-billing.md`** + other spec files — feature details
5. **[Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)** — primary reference for Meta integration

## Meta Tech Provider Model — Understand This

### What you're building
Multi-tenant SaaS where **each customer (salon/spa)** has their own:
- User account (Google OAuth)
- Business Portfolio + WABA (onboarded via Embedded Signup)
- Customer list, reminders, billing
- Templates (shared at Meta level but each biz sees their own status)

**getstarvio acts as Tech Provider** — we proxy all Meta API calls on behalf of our customers.

### Data flow example (send reminder)

```
1. Owner (salon) adds customer "Sarah" with last visit 15 Mar 2026
2. Scheduler runs every minute → finds due reminders
3. Scheduler queries: for each due reminder, what template to use?
4. Backend calls Meta API:
   POST https://graph.facebook.com/v21.0/{phone_number_id}/messages
   {
     messaging_product: "whatsapp",
     to: "628xxx",
     type: "template",
     template: {
       name: "aftercare_followup_1",
       language: { code: "id" },
       components: [{
         type: "body",
         parameters: [
           { type: "text", text: "Sarah" },
           { type: "text", text: "Hair Smoothing" },
           { type: "text", text: "15 Maret 2026" },
           { type: "text", text: "Salon Celestial" }
         ]
       }]
     }
   }
5. Meta sends message to Sarah's WhatsApp
6. Meta sends webhook back → "message delivered"
7. Backend updates reminder.status = 'terkirim'
8. Billing: deduct 1 credit from customer's account
```

### Critical Meta API concepts

- **Phone Number ID** (`phone_number_id`): Used for sending messages. Unique per phone.
- **WABA ID** (`waba_id`): Used for managing templates, webhooks. Unique per WhatsApp Business Account.
- **Business ID** (`business_id`): Parent Business Portfolio that owns WABA.
- **System User token**: Long-lived (doesn't expire) token that Tech Provider uses untuk call Meta. Generated once di Meta Business Manager.
- **24-hour messaging window**: Once customer messages you, you have 24h untuk kirim free-form reply. Setelah itu, harus pakai approved template.
- **Quality rating**: Meta monitors quality — 4 tiers: GREEN / YELLOW / RED / UNKNOWN. Drops kalau banyak customer block/report.
- **Messaging limit tier**: TIER_1K / 10K / 100K / UNLIMITED — jumlah unique customer bisa di-messaging per 24h.

## Tech Non-Negotiables

1. **PostgreSQL** — relational data (users, customers, reminders, templates, etc.)
2. **TypeScript** (if Node) / **Type hints** (if Python) / **Types** (if Go) — no dynamic chaos
3. **Environment-based config** — semua secrets via `.env`, never committed
4. **HTTPS only** — enforced via Nginx + Certbot
5. **Webhook signature verification** — HMAC SHA-256 dengan `META_APP_SECRET`
6. **Access token encryption** — AES-256 at rest, decrypted in-memory only when calling Meta
7. **E2E test wajib** — minimum login → Embedded Signup exchange → template submit flow
8. **Structured logging** — JSON log (no console.log), ship ke Sentry
9. **Graceful shutdown** — SIGTERM → finish in-flight requests → close DB → exit
10. **Multi-tenant data isolation** — every query filter by `user_id`, never leak cross-tenant

## Indonesian Context

- **Timezone:** Asia/Jakarta (WIB) default, but user can change
- **Data residency:** PostgreSQL on DO SGP1 droplet (Singapore — closest acceptable for UU PDP)
- **Phone format:** Store as `628123456789` (no +, no spaces) — normalize on input
- **Currency:** IDR (integer cents, e.g. 249000 for Rp 249.000)
- **Date formats:** ISO 8601 (UTC) for API / DB, display conversion in FE

## Working Relationship

**With Okta:**
- He consumes your API
- Agree on contract early (`03-API-CONTRACT.md`)
- Deploy endpoints to staging fast, even if incomplete — unblocks Okta
- Pair session if webhook/auth tricky

**With Sebastian:**
- Business questions, billing decisions, pricing
- Meta App Review form submission (you give him artifacts, he submits)
- Don't ask spec questions — read `prompts/`

## Infrastructure Budget

- **DO Droplet $8-12/mo** — 1GB RAM, 1 vCPU, 25GB SSD, Singapore
- **Backup enabled $1-2/mo** — weekly snapshot
- **DO Spaces optional $5/mo** — S3-compat untuk logo uploads
- **Sentry free tier** — 5k events/mo
- **Uptime Robot free tier** — 50 monitors
- **Total dev phase:** ~$15/mo

**Scale triggers (upgrade later):**
- >100 real customers → 2GB droplet ($12) + Managed Postgres ($15)
- >500 msg/sec → Separate Redis droplet
- >1K customers → Load balancer + multi-droplet

## Quick Links

- Handoff README: `docs/shared/README.md`
- Architecture: `docs/shared/ARCHITECTURE.md`
- Deployment: `docs/shared/DEPLOYMENT.md` (DO setup step-by-step)
- Sprint plan: `docs/shared/SPRINT-PLAN.md`
- Stack options: `01-STACK-OPTIONS.md`
- Database schema: `02-DATABASE-SCHEMA.md`
- API contract: `03-API-CONTRACT.md`
- Meta integration guide: `04-META-INTEGRATION.md` (CRITICAL)
- Your sprint checklist: `05-SPRINT-CHECKLIST.md`

## Success Looks Like

Day 1:
- DO droplet running with Nginx + SSL
- Stack picked, project scaffolded
- Database migrated

Day 7:
- Meta reviewer could call all permission endpoints successfully
- Templates can be submitted via API → get webhook approval
- Send single message works end-to-end

Day 29 (beta launch):
- 5 customers onboarded + sending reminders
- No data breach, no Meta policy violations
- <500ms p99 response time

Let's ship this! 🚀
