# Kevin Sprint Checklist

> Daily tasks dari 20 April s/d 10 Mei. **Check-off per task, update di WA group end-of-day.**

## Sprint 0 — Kickoff (Apr 19–20)

### Saturday Apr 19
- [ ] Baca `docs/shared/README.md`
- [ ] Baca `docs/shared/ARCHITECTURE.md`
- [ ] Baca `docs/shared/DEPLOYMENT.md`
- [ ] Baca `docs/shared/SPRINT-PLAN.md`
- [ ] Baca `docs/shared/COMMUNICATION.md`
- [ ] Baca `docs/shared/ENV-TEMPLATE.md`
- [ ] Baca `docs/kevin/00-OVERVIEW.md`
- [ ] Baca `docs/kevin/01-STACK-OPTIONS.md`
- [ ] Baca `docs/kevin/02-DATABASE-SCHEMA.md`
- [ ] Baca `docs/kevin/03-API-CONTRACT.md`
- [ ] Baca `docs/kevin/04-META-INTEGRATION.md` — CRITICAL
- [ ] Baca `prompts/00-global.md` — schema
- [ ] Baca `prompts/09-billing.md` — billing model
- [ ] Baca `prompts/META-APP-REVIEW.md` — compliance

### Sunday Apr 20 (hari libur, optional setup)
- [ ] Create DigitalOcean account (Sebastian provide billing)
- [ ] Create droplet: Ubuntu 24.04 x64, SGP1, $8/mo (1GB), backups enabled
- [ ] SSH access setup, disable password auth, create `deploy` user
- [ ] UFW firewall (allow ssh, 80, 443)
- [ ] Pick stack decision (internal — confirm di meeting)

### Sunday Apr 20 — 20:00 WIB Meeting #1
- [ ] Join WA video call
- [ ] Confirm stack pilihan
- [ ] Show droplet access / SSH demo
- [ ] Review DB schema with Okta (anything unclear?)
- [ ] Sync dengan Okta pada Day 1 API contract
- [ ] Post EOD update di WA

---

## Sprint 1 — Foundation + Meta Integration (Apr 21–27)

### Monday Apr 21
**Infrastructure:**
- [ ] On droplet: install Nginx, Postgres 16, Redis, Node 20/Python/Go
- [ ] Setup Nginx for `api.getstarvio.com` + get SSL via Certbot
- [ ] DNS pointing `api.getstarvio.com` → droplet IP (confirm with Sebastian)
- [ ] Create `getstarvio_prod` + `getstarvio_staging` databases
- [ ] Test: `curl https://api.getstarvio.com/` responds 502 (expected, no app yet)

**Backend app:**
- [ ] Create branch `feature/be-init`
- [ ] Init project in `/backend` folder dengan chosen stack
- [ ] Setup TypeScript / Python types / Go types
- [ ] Create `/health` endpoint returning `{ status: "ok" }`
- [ ] Setup Prisma / SQLAlchemy / sqlc with DB schema from `02-DATABASE-SCHEMA.md`
- [ ] Run initial migration
- [ ] Setup PM2 config (or systemd for Go)
- [ ] Deploy to droplet, verify `https://api.getstarvio.com/health` works
- [ ] Setup GitHub Actions (or similar) untuk auto-deploy on push to main
- [ ] **EOD update**

### Tuesday Apr 22
**Auth layer:**
- [ ] Google OAuth credentials created (with Sebastian)
- [ ] `GET /auth/google` endpoint (redirect to Google)
- [ ] `GET /auth/google/callback` endpoint (exchange code, upsert user, set cookie)
- [ ] JWT generation + verification helper
- [ ] Auth middleware (parse JWT, load user)
- [ ] `GET /me` endpoint
- [ ] `PATCH /me` endpoint (partial update)
- [ ] `POST /auth/logout`
- [ ] Test with Postman: full OAuth flow end-to-end
- [ ] **EOD update — share Okta endpoint URL for testing**

### Wednesday Apr 23 — Meeting #2 malam 20:00
**Meta integration setup:**
- [ ] Generate System User access token in Meta Business Manager
- [ ] Save `META_SYSTEM_USER_TOKEN` to `.env`
- [ ] Create `MetaAPIClient` class per `04-META-INTEGRATION.md`
- [ ] `POST /meta/embedded-signup/exchange` endpoint — handle full flow:
  - Exchange code
  - Fetch phone/waba/business details
  - Encrypt + save token
  - Subscribe webhook
- [ ] Test with dummy code (mocked) locally
- [ ] **Attend meeting, demo /auth/google + show /me response**
- [ ] **EOD update**

### Thursday Apr 24
**Webhook receiver:**
- [ ] `GET /webhooks/meta` — verification challenge
- [ ] `POST /webhooks/meta` — signature verification (HMAC SHA-256)
- [ ] Webhook event storage (table `webhook_events`)
- [ ] ACK fast (within 20s), process async
- [ ] Dummy handler for `message_template_status_update` field
- [ ] Test: trigger test webhook from Meta App Dashboard → verify received
- [ ] Setup Ngrok for local testing webhook
- [ ] **EOD update**

### Friday Apr 25
**Template management:**
- [ ] `POST /templates` — validate + proxy to Meta `/message_templates`
- [ ] Save template to DB with metaTemplateId + status
- [ ] `GET /templates` — list with status
- [ ] `GET /templates/:id/payload` — return exact JSON that sent to Meta
- [ ] `PUT /templates/:id` — update + resubmit
- [ ] `DELETE /templates/:id` — delete from Meta + DB
- [ ] Webhook handler update `message_template_status_update`:
  - Parse `event` (APPROVED/REJECTED/PAUSED)
  - Update template.status in DB
  - Log to audit
- [ ] **Make test API call #1: `business_management`**:
  - Via Graph API Explorer: `GET /me/businesses`
  - Screenshot success response
- [ ] **Make test API call #2: `manage_app_solution`**:
  - Via Graph API Explorer: `GET /{app-id}/subscriptions`
  - Screenshot success response
- [ ] **EOD update**

### Saturday Apr 26
**Message sending:**
- [ ] `POST /messages/send` — build template payload + call Meta `/messages`
- [ ] Return `metaMessageId` in response
- [ ] Log reminder ke DB with `status='pending'`
- [ ] Credit deduction logic (sub first, then topup)
- [ ] Billing history entry
- [ ] Webhook handler for `messages` field:
  - `status: 'sent' | 'delivered' | 'read' | 'failed'`
  - Update reminder.status accordingly
- [ ] **Test send-to-own-phone E2E** (use your real WA number as test recipient)
- [ ] **EOD update**

### Sunday Apr 27 — Meeting #3 malam 20:00
**Final Sprint 1:**
- [ ] `DELETE /me/data` endpoint (GDPR)
- [ ] `GET /me/data/export` endpoint
- [ ] Admin endpoints basic:
  - `POST /admin/login` (email+password)
  - `GET /admin/businesses` (list)
  - `POST /admin/businesses/:id/impersonate`
- [ ] E2E test: Okta's FE → login → Embedded Signup → template submit → send test
- [ ] Fix any integration bugs
- [ ] **Attend meeting, demo full flow**
- [ ] Verify Meta App Dashboard → Review → Testing shows all permissions ✓
- [ ] **EOD update**

---

## Sprint 2 — Polish + SUBMIT (Apr 28–29)

### Monday Apr 28
**Production readiness:**
- [ ] Verify all endpoints deployed to `api.getstarvio.com` production
- [ ] Verify webhook URL verified di Meta App Dashboard
- [ ] Subscribe all webhook fields:
  - messages
  - message_template_status_update
  - account_update
  - smb_app_state_sync (Coexistence)
  - smb_message_echoes (Coexistence)
  - history (Coexistence)
- [ ] Test webhook delivery: trigger from Meta → verify logged in DB
- [ ] Security pass:
  - [ ] Rate limiting active on all endpoints
  - [ ] CORS restricted to `getstarvio.com`
  - [ ] Helmet headers set
  - [ ] JWT secret strong (64+ chars)
  - [ ] Encryption key strong (32 bytes base64)
  - [ ] `.env` not in git
  - [ ] No console.log in production
- [ ] Error tracking: Sentry connected
- [ ] Uptime monitoring: UptimeRobot setup
- [ ] Backup verified: pg_dump runs daily
- [ ] **EOD update — production ready status**

### Tuesday Apr 29 — **LAST DAY BEFORE SUBMIT**
**Morning:**
- [ ] Re-verify all 6 permission test calls shown as completed di Meta dashboard:
  - ✅ whatsapp_business_messaging (1 call)
  - ✅ whatsapp_business_management (16+ calls)
  - ✅ public_profile (3+ calls)
  - ✅ email (auto-granted)
  - ✅ business_management (**1 call required** — done Friday)
  - ✅ manage_app_solution (**1 call required** — done Friday)
- [ ] **Remove `whatsapp_business_manage_events`** dari submission (not needed)
- [ ] Screenshot Meta dashboard: all test calls ✓

**Afternoon:**
- [ ] Support Okta for final E2E tests
- [ ] Review production logs — no errors
- [ ] Test reviewer flow from clean browser: login → Embedded Signup → template submit
- [ ] Export compliance pages ke PDF (privacy, terms, data-deletion)

**Malam 20:00 Meeting #4:**
- [ ] Confirm submission readiness
- [ ] Support Sebastian fill Meta App Review form
- [ ] **SUBMIT by 17:00 WIB ideally, latest 23:59**
- [ ] **EOD celebration then sleep**

---

## Sprint 3 — Customer Features (May 1–7)

### Wednesday Apr 30 — post submit
- [ ] Monitor Meta response
- [ ] Start Sprint 3 work

### May 1–3: Core features
**Customers:**
- [ ] `GET /customers` with filters + pagination
- [ ] `POST /customers` + validation
- [ ] `GET /customers/:id` with services
- [ ] `PUT /customers/:id`
- [ ] `DELETE /customers/:id` (soft delete)
- [ ] `POST /customers/import` CSV parser
- [ ] `customer_services` CRUD logic

**Categories:**
- [ ] `GET /categories` with customer count
- [ ] `POST /categories`
- [ ] `PUT /categories/:id`
- [ ] `DELETE /categories/:id` (with FK protection)

**Visits:**
- [ ] `POST /visits` — record visit, update `last_visit_date`
- [ ] Recompute `next_reminder_at` for affected customers

### Sunday May 4 — 20:00 Meeting #5
- [ ] Check Meta approval status
- [ ] **If approved:** celebrate, plan beta
- [ ] **If rejected:** read reason, fix, resubmit within 24h
- [ ] Demo customer CRUD + visit recording

### May 5–7: Scheduler + Admin
**Scheduler:**
- [ ] Setup cron job / BullMQ worker running every 1 minute
- [ ] Query: find customer_services where `next_reminder_at <= NOW() + 1 hour` AND no reminder today
- [ ] Create reminder rows with `status='pending'`, `scheduledAt=next_reminder_at`
- [ ] Enqueue send job for each
- [ ] Worker processes job: call sendReminder (from Sprint 1)

**Admin endpoints full:**
- [ ] `GET /admin/businesses` with pagination + filters
- [ ] `GET /admin/businesses/:id` with full detail
- [ ] `POST /admin/businesses/:id/suspend`
- [ ] `POST /admin/businesses/:id/add-credit` (password-gated)
- [ ] `POST /admin/businesses/:id/extend-trial`
- [ ] `POST /admin/impersonate/:userId` + audit log
- [ ] `GET /admin/audit-log` with filters

**Billing (Stripe):**
- [ ] `POST /billing/subscribe` create Stripe Payment Intent
- [ ] `POST /billing/topup` create Stripe Payment Intent
- [ ] `POST /webhooks/stripe` — handle `payment_intent.succeeded`:
  - Add credits to user
  - Update plan status
  - Add billing_history entry
- [ ] `POST /billing/cancel`

**Public:**
- [ ] `GET /public/checkin/:slug`
- [ ] `POST /public/checkin/:slug` (register customer from QR)

### Thursday May 7 — 20:00 Meeting #6
- [ ] Demo full feature set
- [ ] Integration tests passing
- [ ] Beta onboarding prep
- [ ] Review Sebastian's list of 5 beta users

---

## Sprint 4 — Beta Launch (May 8–10)

### Friday May 8
- [ ] Performance tuning:
  - [ ] Query optimization (add indexes, EXPLAIN check)
  - [ ] Connection pool tuning
  - [ ] Postgres config tuning (shared_buffers, etc.)
  - [ ] Memory check on droplet (should stay <900MB)
- [ ] Load test simulation: 5 concurrent users, 100 msg/hour
- [ ] Verify backups working: `pg_dump` cron + restore test on staging
- [ ] Setup sentry performance monitoring
- [ ] **EOD update**

### Saturday May 9
- [ ] Standby for bug fixes
- [ ] Write + document admin procedures untuk Sebastian:
  - How to add credit manually
  - How to suspend/activate account
  - How to read audit log
  - How to extract user data for support
- [ ] Pre-seed 5 beta user accounts (Sebastian provide emails + biz names)

### Sunday May 10 — **LAUNCH DAY** 🚀
- [ ] Morning: monitor all systems
- [ ] Afternoon: support beta user onboarding calls (you may be on call)
- [ ] Monitor Meta API quota (shouldn't hit limits)
- [ ] Monitor Sentry for any errors
- [ ] Watch reminder scheduler — first real reminders send?
- [ ] **EOD: post summary of launch**

### Monday May 11 — Meeting #7 Post-launch
- [ ] Review 24-hour metrics:
  - Successful API calls
  - Failed API calls (debug)
  - Messages sent / delivered / failed
  - Response times p50/p95/p99
- [ ] Bug triage
- [ ] Plan next week

---

## Definition of Done per Task

- [ ] Code reviewed by Okta
- [ ] Unit tests pass (where applicable)
- [ ] Integration tests pass
- [ ] Database migration tested
- [ ] E2E test covers new flow (for critical features)
- [ ] Deployed to staging + smoke tested
- [ ] No secrets in commit
- [ ] Logs don't contain PII or tokens
- [ ] Error handling graceful
- [ ] Documentation updated (API contract if changed)

## Red Flags (escalate immediately in WA)

- 🚨 Deployment failing (droplet, SSL, DNS)
- 🚨 Webhook signature verification fails
- 🚨 Meta API returns unexpected error codes
- 🚨 Database migration hang or data loss risk
- 🚨 Memory usage on droplet >900MB
- 🚨 Critical endpoint 500ing
- 🚨 Meta approval rejection (post-submit)
- 🚨 Potentially missing 29 April deadline

## Quick Reference Commands

```bash
# SSH to droplet
ssh deploy@api.getstarvio.com

# Tail logs
pm2 logs getstarvio
tail -f /var/log/nginx/api.access.log

# Restart app
pm2 reload getstarvio

# DB connect
psql -U deploy getstarvio_prod

# Run migrations
cd /home/deploy/getstarvio/backend
npm run migrate  # or python alembic upgrade head

# pg_dump manual
pg_dump -U deploy getstarvio_prod | gzip > ~/backup-$(date +%Y%m%d).sql.gz

# Check memory/disk
free -h
df -h

# Meta API test (via curl)
curl "https://graph.facebook.com/v21.0/me/businesses" \
  -H "Authorization: Bearer ${META_SYSTEM_USER_TOKEN}"
```

Good luck Kevin! 💪
