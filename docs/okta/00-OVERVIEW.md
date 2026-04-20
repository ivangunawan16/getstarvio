# Okta — Frontend Overview

Halo Okta! Welcome to getstarvio. Dokumen ini overview tugas kamu untuk 4 minggu ke depan.

## Project in 1 Paragraph

getstarvio adalah WhatsApp SaaS untuk UMKM Indonesia (salon, spa, klinik, dll) yang kirim pengingat otomatis ke customer saat waktunya balik untuk perawatan lanjutan. Kita registered sebagai **Meta Tech Provider** — onboard customer's WhatsApp Business Account via Embedded Signup dengan Coexistence mode. Mockup HTML sudah ada di `mockup/` folder (visual reference), spec detail di `prompts/`. Tugas kamu: convert mockup jadi production FE yang talk ke Kevin's backend + integrate dengan Meta JS SDK.

## Hard Deadlines

- **29 April 23:59 WIB** — Meta App Review submission (butuh FE live di production)
- **10 Mei 2026** — Beta launch dengan 5 paid users
- **Meeting:** Senin + Kamis 20:00 WIB via WA video

## Your Responsibilities

### Sprint 1 (Apr 21–27) — Foundation
1. Setup FE project (framework pilih sendiri, lihat `01-STACK-OPTIONS.md`)
2. Port mockup design system → Tailwind config
3. Build pages critical untuk Meta review:
   - Login (Google OAuth UI)
   - Onboarding Step 1 (Embedded Signup critical)
   - Dashboard (basic)
   - Admin Templates tab
   - Settings WhatsApp section
4. Integrate Facebook JS SDK untuk Embedded Signup
5. Wire up to Kevin's backend API
6. Deploy to Vercel

### Sprint 2 (Apr 28–29) — Polish
1. Record 2 videos for Meta submission (storyline di `prompts/META-APP-REVIEW.md`)
2. Fix any UI bugs
3. Production deploy ke `getstarvio.com`

### Sprint 3 (May 1–7) — Remaining Features
1. Customer management UI (Pelanggan page)
2. CSV import
3. Admin panel: Tipe Layanan, Plan Config, Audit log
4. Settings: profile, logo upload
5. Check-in public page
6. Dashboard full with ROI card

### Sprint 4 (May 8–10) — Launch
1. Final QA
2. Onboard 5 beta users
3. Monitor + fix issues

## Your Sources of Truth

In priority order:

1. **`prompts/00-global.md`** — Schema, design system, business rules. **THIS IS LAW.**
2. **`prompts/01-13-*.md`** — Per-page detailed spec
3. **`mockup/getstarvio-*.html`** — Visual reference (HTML styling, interactions, copy)
4. **`docs/okta/*.md`** — Technical guidance khusus kamu
5. **`prompts/META-APP-REVIEW.md`** — What Meta will check
6. **`mockup/getstarvio-design-system.md`** — Design tokens, colors, components

## The Mockup is NOT Production Code

**Penting:** HTML di `mockup/` pakai localStorage untuk simulate everything. Kamu **JANGAN copy-paste** `getstarvio-dashboard.html` jadi `Dashboard.tsx` — lihat sebagai **visual blueprint only**.

Yang harus kamu re-implement:
- HTML structure → React/Vue components
- localStorage reads → API calls via `fetch`/`axios` to Kevin's backend
- localStorage writes → POST/PUT API calls
- Inline `<script>` → proper component logic with hooks/composables
- `loadU()` → replace dengan `useAuth()` hook atau similar

Yang OK copy-paste:
- CSS classes + styles (semua Tailwind-compatible)
- Copy text (Bahasa Indonesia)
- Icon SVGs
- Layout structure (grid, flex)
- Form validation logic
- Interaction patterns (modals, accordions, tooltips)

## Tech Non-Negotiables

1. **Tailwind CSS** — match mockup's design system tokens
2. **TypeScript** — type safety, no `any`
3. **Mobile responsive** — test di iPhone 12/13 size (390x844)
4. **Accessibility** — `aria-label`, keyboard nav, focus states
5. **Error boundaries** — kalau API fail, graceful UI
6. **Loading states** — skeleton atau spinner untuk every async action
7. **Form validation** — inline errors, don't submit invalid
8. **E2E test wajib** — minimum untuk login → embed signup → template submit
9. **No console.log** in production build (kalau ada, build fail)

## Indonesian UX Context

- **Language:** Bahasa Indonesia informal (bukan super formal)
- **Currency:** IDR format dengan titik thousand separator (`Rp 249.000`, BUKAN `Rp249,000`)
- **Phone:** Format `+62 812 3456 7890` untuk display, `628123456789` untuk storage
- **Date:** `15 Maret 2026` untuk UI, `2026-03-15` untuk API
- **Timezone:** WIB default (Asia/Jakarta)
- **Copy tone:** Friendly, ga formal — "pakai", "kamu", "yuk", etc.

## Working Relationship

**With Kevin:**
- You consume his API
- Coordinate early on API contract (`kevin/03-API-CONTRACT.md` is canonical)
- Early morning: check if his endpoints ready for your day's work
- Pair session 30 min kalau stuck debugging cross-stack issue

**With Sebastian:**
- Non-technical questions, business priorities
- UX / design decisions (kalau ragu pilih X atau Y)
- Don't ask spec questions — read `prompts/` first

## Quick Links

- Handoff README: `docs/shared/README.md`
- Architecture: `docs/shared/ARCHITECTURE.md`
- Deployment: `docs/shared/DEPLOYMENT.md`
- Sprint plan: `docs/shared/SPRINT-PLAN.md`
- Stack options: `01-STACK-OPTIONS.md`
- Embedded Signup guide: `02-EMBEDDED-SIGNUP.md` (CRITICAL)
- API integration: `03-API-INTEGRATION.md`
- Your sprint checklist: `04-SPRINT-CHECKLIST.md`

## Success Looks Like

Day 1:
- Stack picked, project scaffolded
- Deployed blank "hello world" to Vercel
- Read all docs

Day 7:
- Meta reviewer could test login → Embedded Signup → see captured data
- Template management UI working with live Meta API

Day 29 (beta launch):
- 5 UMKM owners using app
- No critical bugs
- Responsive across devices

Let's ship this! 🚀
