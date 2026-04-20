# Sprint Plan — 4 Weeks to Beta Launch

> **Today:** 19 April 2026 (Min) · **Meta submit:** 29 Apr 23:59 · **Beta launch:** 10 Mei

## Timeline Overview

```
Week          Dates           Focus
─────────────────────────────────────────────────────────────
Sprint 0      Apr 19–20       Kickoff + infra setup
Sprint 1      Apr 21–27       Foundation + Meta integration
Sprint 2      Apr 28–29       Final polish + Meta submit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Wait Meta review: Apr 30–May 3, up to 5 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sprint 3      May 1–7         Customer features + scheduler
Sprint 4      May 8–10        Beta onboarding + launch
```

---

## Sprint 0 — Kickoff (Apr 19–20)

### Saturday Apr 19 (TODAY)
- Sebastian kirim handoff docs ke Okta + Kevin via WA
- Both devs baca all `docs/shared/*` + pick stack

### Sunday Apr 20
**Morning:**
- Okta: Create Vercel account + link GitHub
- Kevin: Create DigitalOcean droplet (Singapore SGP1, $8/mo)
- Both: Familiarize dengan `prompts/00-global.md` schema

**Evening 20:00 WIB — Meeting #1 (WA video call):**
- Stack pilihan finalize (Okta + Kevin)
- Repo structure confirm (monorepo: frontend/, backend/, docs/, prompts/, mockup/)
- DO droplet status + SSH access shared
- Sprint 1 task assignment

---

## Sprint 1 — Foundation + Meta Integration (Apr 21–27)

### Week Goal
- ✅ Google OAuth working
- ✅ Embedded Signup captures waba_id + phone_id + business_id
- ✅ Template submission via Meta API working
- ✅ Send single test message via Meta API
- ✅ Webhook handler receiving events
- ✅ 2 remaining Meta API test calls done (business_management + manage_app_solution)

### Monday Apr 21
**Okta:**
- [ ] Init FE project (Next.js or Vite, your choice)
- [ ] Setup Tailwind + port `mockup/getstarvio-design-system.md` tokens
- [ ] Build login page (UI only, no backend yet)
- [ ] Deploy first build to Vercel staging

**Kevin:**
- [ ] Init BE project (Node/Python/Go)
- [ ] Setup database schema (lihat `kevin/02-DATABASE-SCHEMA.md`)
- [ ] Run migrations on local + droplet Postgres
- [ ] Setup Nginx + SSL for api.getstarvio.com (lihat DEPLOYMENT.md)
- [ ] Basic `/health` endpoint returning 200

### Tuesday Apr 22
**Okta:**
- [ ] Google OAuth button integration (FE side)
- [ ] Session storage (httpOnly cookie or JWT in localStorage)
- [ ] Protected routes

**Kevin:**
- [ ] `POST /auth/google` endpoint (exchange Google ID token for session)
- [ ] User create-or-fetch from DB
- [ ] JWT generation for session
- [ ] `GET /me` endpoint (return current user)

**End-of-day E2E test:** Login via Google, land on dashboard.

### Wednesday Apr 23 — Meeting #2 malam 20:00
**Okta:**
- [ ] Port Dashboard page (kalau login jalan, tampilkan data dari `GET /me`)
- [ ] Port Onboarding Step 1 pre-connection state
- [ ] Install Facebook JS SDK (lihat `okta/02-EMBEDDED-SIGNUP.md`)

**Kevin:**
- [ ] `POST /meta/embedded-signup/exchange` endpoint
  - Input: `{ code, waba_id, phone_number_id, business_id }`
  - Exchange code → access token via Meta OAuth
  - Fetch phone details, WABA details, business details
  - Store encrypted token + ids in `users.meta` field
- [ ] `GET /me/meta` endpoint (return captured Meta data)

**Meeting agenda:**
- Demo login flow end-to-end
- Confirm API contract for Embedded Signup
- Blockers?

### Thursday Apr 24
**Okta:**
- [ ] Embedded Signup integration — FB.login with extras
- [ ] Capture message event → POST to `/meta/embedded-signup/exchange`
- [ ] Show success state with captured data

**Kevin:**
- [ ] Webhook receiver setup: `POST /webhooks/meta`
  - GET challenge verification
  - POST signature verification (HMAC-SHA256)
  - Router for different field types
- [ ] Dummy handler for `message_template_status_update`

### Friday Apr 25
**Okta:**
- [ ] Port Admin Templates tab (UI dari mockup)
- [ ] Template list page fetching `GET /templates`
- [ ] New template modal (body + example params + preview)

**Kevin:**
- [ ] `POST /templates` endpoint → proxy to `POST /{WABA_ID}/message_templates`
- [ ] Store template in DB + meta_template_id
- [ ] `GET /templates` endpoint
- [ ] Make **1 API test call** for `business_management` permission via Graph API Explorer (manual)
- [ ] Make **1 API test call** for `manage_app_solution` permission via Graph API Explorer (manual)

### Saturday Apr 26
**Okta:**
- [ ] Polish: Settings WhatsApp persistent display
- [ ] Polish: Admin Customer Detail WABA info
- [ ] E2E test: login → onboard → submit template → see PENDING status

**Kevin:**
- [ ] `POST /messages/send` endpoint (proxy to Meta)
- [ ] Log reminder to DB with `status = 'pending'`
- [ ] Webhook handler: update reminder status on delivery
- [ ] Data deletion endpoint `DELETE /users/me/data`

### Sunday Apr 27 — Meeting #3 malam 20:00
**Both:**
- [ ] Full E2E test: login → Embedded Signup → template submit → send test message → receive delivery webhook
- [ ] Fix critical bugs

**Meeting agenda:**
- Demo complete flow
- Identify what's blocking submit
- Plan Sprint 2 (only 2 days!)

---

## Sprint 2 — Final Polish + META SUBMIT (Apr 28–29)

### Monday Apr 28
**Okta:**
- [ ] **Record Video 1** (`whatsapp_business_messaging` screencast)
  - Follow storyline di `prompts/META-APP-REVIEW.md`
  - Duration 3-4 min, max 1440px width, no audio
- [ ] **Record Video 2** (`whatsapp_business_management` screencast)
  - Template CRUD demo, 3-5 min
- [ ] Deploy `main` branch to production Vercel
- [ ] Final UX polish (empty states, loading, errors)

**Kevin:**
- [ ] Production deploy to DO droplet (pm2 start --env production)
- [ ] Verify Meta webhook receiving events at production URL
- [ ] Final test calls check di Meta App Dashboard → Review → Testing (all required should show green)
- [ ] Export compliance pages ke PDF:
  - privacy-policy.pdf
  - terms-of-service.pdf
  - data-deletion-process.pdf
- [ ] Create architecture diagram (PDF or PNG)

### Tuesday Apr 29 — **LAST DAY BEFORE SUBMIT**
**Morning (both):**
- [ ] Verify test user Facebook registered di App Dashboard
- [ ] Check all fields di `META-APP-REVIEW.md` reference
- [ ] Replace all `[LEGAL_ENTITY_NAME]` placeholders dengan actual PT data

**Afternoon:**
- [ ] Fill Meta App Review form (copy-paste dari META-APP-REVIEW.md)
- [ ] Upload 2 videos + 3 PDFs
- [ ] Sebastian review submission sebelum submit
- [ ] **SUBMIT** (target 17:00 WIB — jangan last minute)

**Meeting #4 malam 20:00:**
- Confirm submission sent
- Watch Meta response email/dashboard notifications
- Plan Sprint 3 (no blockers from Meta review)

---

## Sprint 3 — Customer Features (May 1–7)

### Build paralel dengan Meta review wait (1-5 hari)

### Monday May 4 — Meeting #5 malam 20:00
**Expected:** Meta approval atau rejection by now (5 business days from Apr 29)

**If approved:** Plan beta onboarding
**If rejected:** Read rejection reason + plan fix + resubmit within 24h

### Features to build Sprint 3:
**Okta:**
- [ ] Customer management UI (Pelanggan page) — CRUD
- [ ] CSV import UI
- [ ] Admin Tipe Layanan tab
- [ ] Admin Plan Config tab (editable pricing)
- [ ] Settings profile + logo upload
- [ ] Check-in public page (`getstarvio.com/checkin/[slug]`)
- [ ] Impersonate user feature (admin)
- [ ] Audit log UI

**Kevin:**
- [ ] Customer CRUD endpoints
- [ ] CSV import endpoint
- [ ] Scheduler: cron every minute → find due reminders → send via Meta API
- [ ] Billing endpoints (Stripe integration — Phase 2 OK to delay sampai May 7)
- [ ] Audit log endpoints
- [ ] Admin impersonate endpoints
- [ ] Multi-tenant data isolation (each user only sees their own data)

### Thursday May 7 — Meeting #6 malam 20:00
- [ ] Demo full feature set
- [ ] E2E test scenarios for 5 beta users
- [ ] Finalize onboarding guide untuk beta user

---

## Sprint 4 — Beta Launch (May 8–10)

### Friday May 8
**Both:**
- [ ] Smoke test full flow with REAL beta-style test user
- [ ] Load test: 5 concurrent users, 100 msg/hour
- [ ] Performance check: response < 500ms for all endpoints
- [ ] Backup verification: restore from pg_dump successfully

### Saturday May 9
**Both:**
- [ ] Create onboarding docs untuk 5 beta users (Google Doc)
- [ ] Pre-register 5 beta accounts (Sebastian provide names + WA)
- [ ] Schedule 30-min individual onboarding calls dengan setiap beta user

### Sunday May 10 — **BETA LAUNCH** 🚀
**Morning:**
- [ ] Monitor deployment
- [ ] Standby for issues

**Afternoon:**
- [ ] Beta user 1 onboarding call (Sebastian + Okta present)
- [ ] Beta user 2 onboarding call
- [ ] etc.

**Evening:**
- [ ] Monitor first reminders sent
- [ ] Respond to any issues in WA group

### Monday May 11 — Meeting #7 post-launch retro
- [ ] Review 24-hour metrics
- [ ] Bug triage
- [ ] Plan week ahead

---

## Dependencies & Critical Path

```
Kevin MUST deliver (blocks Okta):
├─ Day 1-2: Auth endpoint + DB schema
├─ Day 3: Meta exchange endpoint (Okta blocked sampai ini ready)
├─ Day 4: Webhook endpoint (Meta won't be happy without this)
├─ Day 5: Template + Send endpoints
└─ Day 7: Scheduler (post-approval only)

Okta MUST deliver (blocks Kevin testing):
├─ Day 1-2: Login page + dashboard shell
├─ Day 3-4: FB SDK integration UI + Template modal
├─ Day 5: Admin Templates page
└─ Day 6-7: Settings WhatsApp, Customer Detail
```

**Critical path:** Embedded Signup integration (Day 3-4) — kalau ini slip, Meta submit slip.

## Risk Register

| Risk | Mitigation |
|---|---|
| FB SDK tidak cooperate dengan framework | Pair session Day 3 morning, allocate full day |
| Meta webhook signature verification tricky | Kevin pre-read docs Day 1, test dengan curl |
| SSL cert issue for api.getstarvio.com | Run Certbot earlier (Day 1 or 2) |
| DO droplet 1GB RAM insufficient | Monitor from Day 1, scale to 2GB ($12) if needed |
| Meta reject first submission | Budget 48h buffer to fix + resubmit (May 1-2) |
| Beta users tidak siap onboard | Sebastian confirm 5 users availability by May 5 |

## Non-Negotiables

1. **Submit Meta by 29 April 23:59 WIB** — hard deadline, no slip
2. **Record 2 videos by 28 April** — buffer day for re-record
3. **E2E test wajib** for login → embed signup → template submit flow minimum
4. **Git flow:** feature branches → staging → main (no direct commit to main)
5. **PR review:** Okta ↔ Kevin pair review, both approve before merge
6. **Daily update at WA group end-of-day** (even 1 sentence: "done X, blocked on Y")
