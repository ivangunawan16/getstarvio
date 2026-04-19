# getstarvio

WhatsApp aftercare reminder SaaS untuk UMKM Indonesia (salon, spa, klinik, barbershop, nail studio, dll). Meta WhatsApp Business Platform Tech Provider.

## 📌 Current Status (19 April 2026)

- ✅ **Mockup** — Full HTML prototype dengan design system finalized
- ✅ **Spec** — Canonical specs per-page di `prompts/`
- ✅ **Compliance** — Privacy, ToS, Data Deletion pages live
- ✅ **Meta prep** — 14/16 API test calls done, 2 remaining
- 🚧 **Production build** — In progress (Okta FE + Kevin BE)
- 🎯 **Meta submit:** **29 April 2026 23:59 WIB**
- 🚀 **Beta launch:** **10 Mei 2026** dengan 5 paid users

## 📁 Repo Structure

```
getstarvio/
├── README.md                    ← you are here
│
├── docs/                        ← Developer handoff package
│   ├── shared/                  ← READ FIRST (both devs)
│   │   ├── README.md            ← Handoff entry point
│   │   ├── ARCHITECTURE.md      ← System overview
│   │   ├── DEPLOYMENT.md        ← DO + Vercel setup
│   │   ├── SPRINT-PLAN.md       ← 4-week timeline
│   │   ├── ENV-TEMPLATE.md      ← .env variables
│   │   └── COMMUNICATION.md     ← WA group, meetings, PR rules
│   ├── okta/                    ← Frontend (Okta)
│   └── kevin/                   ← Backend (Kevin)
│
├── prompts/                     ← Source-of-truth specs (DO NOT DELETE)
│   ├── 00-global.md             ← Schema + rules + design system
│   ├── 01-13-*.md               ← Per-page spec
│   ├── META-APP-REVIEW.md       ← Meta submission compliance doc
│   ├── AGENT-PROFILE.md         ← AI agent behavior
│   ├── BACKLOG.md               ← Feature backlog
│   ├── getstarvio-design-system.md
│   └── README.md
│
├── mockup/                      ← HTML prototype (visual reference)
│   ├── getstarvio-*.html
│   ├── index.html               ← Landing page
│   ├── privacy.html             ← Privacy policy (live)
│   ├── terms.html               ← Terms of service (live)
│   └── data-deletion.html       ← Data deletion page (live)
│
├── frontend/                    ← Okta builds here (Sprint 1+)
└── backend/                     ← Kevin builds here (Sprint 1+)
```

> ⚠️ **For developers:** Mockup HTML is **visual reference only** — tidak dipakai as production code. Read `docs/shared/README.md` first untuk handoff instructions.

## 🚀 Quick Start for Devs

### New to the project?

1. Read `docs/shared/README.md` — it's your map
2. Read `docs/shared/ARCHITECTURE.md` — system design
3. Read `docs/shared/SPRINT-PLAN.md` — timeline + deadlines
4. Then role-specific docs:
   - **Okta (Frontend):** `docs/okta/*.md`
   - **Kevin (Backend):** `docs/kevin/*.md`

### Already onboarded?

- Sprint checklist: `docs/okta/04-SPRINT-CHECKLIST.md` / `docs/kevin/05-SPRINT-CHECKLIST.md`
- API contract (canonical): `docs/kevin/03-API-CONTRACT.md`
- Embedded Signup guide: `docs/okta/02-EMBEDDED-SIGNUP.md`
- Meta integration: `docs/kevin/04-META-INTEGRATION.md`

## 📞 Team

| Name | Role | Tugas |
|---|---|---|
| Sebastian | Owner | Business decisions, Meta submission, beta onboarding |
| Okta | Frontend | FE production app, Vercel deployment |
| Kevin | Backend | BE production app, DO droplet, Meta integration |

**Communication:** WhatsApp group `getstarvio dev`
**Meetings:** Senin + Kamis 20:00 WIB

## 🛠 Tech Stack (TBD by devs)

Constraints:
- Monorepo (this repo)
- PostgreSQL database
- DigitalOcean droplet ($8/mo SGP1) backend
- Vercel frontend (free tier)
- TypeScript / TypeScript-like types wajib
- E2E tests wajib

Options di `docs/okta/01-STACK-OPTIONS.md` dan `docs/kevin/01-STACK-OPTIONS.md`.

## 🎯 Deadlines

| Date | Milestone |
|---|---|
| **Apr 21-26** | Sprint 1 — Foundation + Meta integration |
| **Apr 27** | Full E2E flow working |
| **Apr 28** | Record 2 videos untuk Meta |
| **Apr 29 23:59** | **SUBMIT Meta App Review** |
| **May 1-3** | Meta review (24h - 5 days) |
| **May 1-9** | Sprint 3-4 — Remaining features + beta prep |
| **May 10** | 🚀 **BETA LAUNCH** |

## 🔗 External Resources

- **Meta App Dashboard:** https://developers.facebook.com/apps/2020424788827939/
- **Staging:** `staging.getstarvio.com` (Vercel preview)
- **Production FE:** https://getstarvio.com
- **Production API:** https://api.getstarvio.com
- **Admin panel:** `<random>.getstarvio.com` (TBD)
- **Public pages:** 
  - https://getstarvio.com/privacy.html
  - https://getstarvio.com/terms.html
  - https://getstarvio.com/data-deletion.html

## 🚨 Before Shipping to Meta

Critical checklist (see `prompts/META-APP-REVIEW.md` for full):

- [ ] All `[LEGAL_ENTITY_NAME]` placeholders replaced di META-APP-REVIEW.md
- [ ] 2 remaining API test calls done (`business_management` + `manage_app_solution`)
- [ ] `whatsapp_business_manage_events` REMOVED dari submission
- [ ] Videos 1 & 2 recorded (max 1440px, MP4, no audio)
- [ ] Compliance pages live + exported to PDF
- [ ] Facebook test user registered di App Dashboard
- [ ] Reviewer credentials updated (regenerated passwords)
- [ ] Production deploy working end-to-end
- [ ] Webhook URL verified di Meta

## 🔒 Security

- Never commit `.env` files
- Never log access tokens
- HTTPS only (Nginx + Let's Encrypt)
- Access tokens encrypted AES-256-GCM at rest
- Webhook HMAC SHA-256 signature verification
- Data residency: Jakarta/Singapore (UU PDP compliant)

## 📝 License

Proprietary — PT Cakra Digital Indonesia. All rights reserved.
