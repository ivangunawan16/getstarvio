# Okta Sprint Checklist

> Daily tasks dari 20 April s/d 10 Mei. **Check-off per task, update di WA group end-of-day.**

## Sprint 0 — Kickoff (Apr 19–20)

### Saturday Apr 19
- [ ] Baca `docs/shared/README.md`
- [ ] Baca `docs/shared/ARCHITECTURE.md`
- [ ] Baca `docs/shared/SPRINT-PLAN.md`
- [ ] Baca `docs/shared/COMMUNICATION.md`
- [ ] Baca `docs/okta/00-OVERVIEW.md`
- [ ] Baca `docs/okta/01-STACK-OPTIONS.md`
- [ ] Baca `docs/okta/02-EMBEDDED-SIGNUP.md` — CRITICAL
- [ ] Baca `docs/okta/03-API-INTEGRATION.md`
- [ ] Baca `prompts/00-global.md` — schema + design system
- [ ] Baca `prompts/02-onboarding.md` — onboarding spec
- [ ] Baca `prompts/META-APP-REVIEW.md` — compliance

### Sunday Apr 20 (hari libur, optional setup)
- [ ] Create Vercel account (link dengan GitHub)
- [ ] Pick stack decision (internal — confirm di meeting #1)
- [ ] Review mockup `getstarvio-onboarding.html` + `getstarvio-admin.html`
- [ ] Install tools (Node, framework CLI, dll)

### Sunday Apr 20 — 20:00 WIB Meeting #1
- [ ] Join WA video call
- [ ] Confirm stack pilihan
- [ ] Confirm Vercel + GitHub access OK
- [ ] Sync dengan Kevin on Day 1 tasks
- [ ] Post EOD update di WA

---

## Sprint 1 — Foundation + Meta Integration (Apr 21–27)

### Monday Apr 21
- [ ] Create branch `feature/fe-init`
- [ ] Scaffold FE project di `/frontend` folder
- [ ] Config Tailwind dengan tokens dari `mockup/getstarvio-design-system.md`:
  - Colors: lime, lime-dk, ink, bg, bg2, bg3, border, border2, red, red-dk, amber, amber-dk, blue, blue-dk
  - Fonts: `Sora` (body), `JetBrains Mono` (numbers)
  - Spacing + radius tokens
- [ ] Port login page UI (copy styling dari `mockup/getstarvio-login.html`)
- [ ] Hook up Google OAuth button (UI only, no backend call yet)
- [ ] Deploy first build ke Vercel preview
- [ ] Share preview URL di WA group
- [ ] **EOD update** di WA group

### Tuesday Apr 22
- [ ] Wait for Kevin's `/auth/google` endpoint ready
- [ ] Wire up actual Google OAuth → backend
- [ ] Build `useAuth()` hook + API client (axios instance)
- [ ] Session storage (cookie atau JWT localStorage)
- [ ] Protected route wrapper (redirect kalau no auth)
- [ ] Port Dashboard page basic (greeting + user name)
- [ ] **EOD update**

### Wednesday Apr 23 — 20:00 Meeting #2
- [ ] Install Facebook JS SDK
- [ ] Port Onboarding Step 1 UI (pre-connection state)
- [ ] Implement pre-connection checklist:
  - WA Business app version check item
  - 7-day active radio buttons (lt7 blocks submit)
  - Country availability notice
- [ ] Begin Embedded Signup integration (can be WIP, finish Thu)
- [ ] Attend meeting, demo login flow
- [ ] **EOD update**

### Thursday Apr 24
- [ ] Complete Embedded Signup integration:
  - `FB.login()` with correct `extras`
  - Message event listener
  - Origin verification
  - Pass captured data to backend
- [ ] Test dengan staging URL (bukan localhost — ngrok OK for local)
- [ ] Start building Onboarding success state:
  - Tier 1: display phone, verified name, business portfolio
  - Tier 2: quality/tier/coexist badges
  - Tier 3: sync status
  - Tier 4: collapsible tech IDs + copy
- [ ] **EOD update**

### Friday Apr 25
- [ ] Finalize Onboarding success state (all 4 tiers)
- [ ] Port Admin Templates tab UI
- [ ] Template list fetching from `/templates`
- [ ] Template status badges (APPROVED/PENDING/REJECTED)
- [ ] **EOD update**

### Saturday Apr 26
- [ ] Edit Template modal:
  - Name + language + category fields
  - Body textarea
  - Auto-detect `{{N}}` variables
  - Example parameters inputs dinamis
  - Preview pesan (WhatsApp-style bubble)
  - Submit button
- [ ] "View Meta API Payload" modal
- [ ] Port Settings → WhatsApp section
- [ ] Display Meta connection card persistent
- [ ] **EOD update**

### Sunday Apr 27 — 20:00 Meeting #3
- [ ] Full E2E test locally:
  - Login → Dashboard
  - Onboarding → Embedded Signup (mock if needed)
  - Admin Templates → create + submit
  - Settings → see Meta connection
- [ ] Fix critical bugs
- [ ] Write Playwright E2E tests untuk critical path:
  - test('user can login with Google')
  - test('user can complete Embedded Signup')
  - test('user can submit template to Meta')
- [ ] **Attend meeting, demo full flow**
- [ ] **EOD update**

---

## Sprint 2 — Polish + SUBMIT (Apr 28–29)

### Monday Apr 28
- [ ] Deploy to production Vercel (point to `getstarvio.com`)
- [ ] Verify DNS, SSL, domain mapping working
- [ ] **Record Video 1** — `whatsapp_business_messaging` screencast:
  - Follow storyline in `prompts/META-APP-REVIEW.md`
  - Duration 3-4 min, max 1440px width, no audio
  - Show customer list → trigger send → WA receive → webhook delivery
  - Save file: `assets/videos/whatsapp_business_messaging.mp4`
- [ ] **Record Video 2** — `whatsapp_business_management` screencast:
  - Templates tab → create template → fill examples → preview → submit
  - Show status PENDING → webhook APPROVED
  - Save file: `assets/videos/whatsapp_business_management.mp4`
- [ ] Final UX polish:
  - Empty states semua pages
  - Loading skeletons
  - Error boundaries
  - Responsive check 390px width
- [ ] **EOD update — videos ready?**

### Tuesday Apr 29 — **LAST DAY BEFORE SUBMIT**
**Morning:**
- [ ] Re-watch both videos — quality check
- [ ] Re-record kalau ada bagian unclear / glitchy
- [ ] Final sweep: production site all pages work
- [ ] Test kalau reviewer login dari browser baru (incognito)

**Afternoon:**
- [ ] Support Kevin kalau ada issue dengan test calls
- [ ] Verify staging + production same behavior

**Malam 20:00 Meeting #4:**
- [ ] Confirm submission ready
- [ ] Support Sebastian fill Meta App Review form
- [ ] Submit 🎯 (target 17:00, latest 23:59)
- [ ] **Celebrate then sleep**

---

## Sprint 3 — Features (May 1–7)

### Wednesday Apr 30 — Submit day done
- [ ] Monitor Meta response
- [ ] Start Sprint 3 work (no blockers)

### May 1-3 — Core features
- [ ] Port Pelanggan page (customer list + filter + sort + search)
- [ ] Customer detail panel + edit modal
- [ ] Port Catat Kunjungan page (record visit flow)
- [ ] Port Log Pengingat page (delivery history)
- [ ] **Daily EOD updates**

### Sunday May 4 — 20:00 Meeting #5
- [ ] Check Meta approval status
- [ ] If approved: plan beta onboarding
- [ ] If rejected: read reason → Okta + Kevin pair fix → resubmit within 24h
- [ ] Continue Sprint 3 work

### May 5-7 — Admin + Settings
- [ ] Port Admin full — Business list, detail modal, Tipe Layanan, Plan Config
- [ ] Port Admin Audit log page
- [ ] Port Admin Impersonate feature (enter user mode)
- [ ] Port Settings full — Profile, Logo upload (canvas resize), QR check-in section, Notifikasi
- [ ] Port Check-in public page (no auth)
- [ ] CSV import for customers
- [ ] **Daily EOD updates**

### Thursday May 7 — 20:00 Meeting #6
- [ ] Demo full feature set
- [ ] Write remaining E2E tests
- [ ] Beta onboarding guide review

---

## Sprint 4 — Beta Launch (May 8–10)

### Friday May 8
- [ ] Performance optimization:
  - Bundle size check
  - Lighthouse score >85 mobile
  - Image optimization (next/image or lazy load)
- [ ] Smoke test all flows
- [ ] Final responsive check on real devices kalau bisa
- [ ] **EOD update**

### Saturday May 9
- [ ] Standby for bug fixes
- [ ] Prepare beta onboarding screen-share script
- [ ] Review 5 beta user profiles from Sebastian

### Sunday May 10 — **LAUNCH DAY** 🚀
- [ ] Morning: standby for deployment issues
- [ ] Afternoon: join onboarding calls dengan 5 beta users (if available)
- [ ] Monitor Sentry for errors
- [ ] Monitor Vercel logs
- [ ] Quick-fix any UX blocker
- [ ] **EOD: post launch summary**

### Monday May 11 — Meeting #7 Post-launch
- [ ] Review 24-hour metrics
- [ ] Bug triage + prioritize fixes
- [ ] Plan next week

---

## Definition of Done per Task

- [ ] Feature works on Chrome, Safari, Firefox
- [ ] Mobile responsive 390x844 (iPhone 12)
- [ ] Keyboard accessible (Tab, Enter work)
- [ ] Empty state defined
- [ ] Loading state defined
- [ ] Error state defined
- [ ] E2E test pass (critical features)
- [ ] Code reviewed by Kevin
- [ ] No console errors/warnings in production build

## Red Flags (escalate immediately in WA)

- 🚨 Build failing in Vercel
- 🚨 API contract mismatch (Kevin's endpoint returns wrong shape)
- 🚨 Meta SDK not loading on production
- 🚨 Critical UX broken (can't submit form, can't navigate)
- 🚨 Production deployment rollback needed
- 🚨 Potentially missing 29 April deadline

Good luck Okta! 💪
