# getstarvio — Developer Handoff Package

> **For Okta (FE) & Kevin (BE).** Dibuat 19 April 2026.
> Hard deadlines: **Meta submit 29 Apr malam** · **Beta launch 10 Mei**.

## 👋 Welcome

Kalian di-onboard untuk convert getstarvio mockup jadi production app yang bisa di-submit ke Meta App Review. Mockup HTML statis + semua spec detail sudah siap — tugas kalian bikin jadi real backend + frontend dalam waktu sempit.

## 📂 Struktur repo

```
getstarvio/
├── docs/              ← kalian ada di sini
│   ├── shared/        ← baca semua file di sini dulu
│   ├── okta/          ← Okta (Frontend) baca folder ini
│   └── kevin/         ← Kevin (Backend) baca folder ini
│
├── prompts/           ← semua spec detail per-page (single source of truth)
│   ├── 00-global.md   ← WAJIB BACA — schema + rules + design system
│   ├── 01–13-*.md     ← per-page spec (login, onboarding, dashboard, dll)
│   ├── META-APP-REVIEW.md ← compliance checklist untuk submission
│   └── ...
│
├── *.html (at root)   ← HTML files (mockup + public pages):
│   ├── getstarvio-*.html  (13 files) ← MOCKUP visual reference, Okta baca ini
│   ├── index.html         ← Landing page (public, deployed)
│   ├── privacy.html       ← Compliance public page (Meta submission URL)
│   ├── terms.html         ← Compliance public page (Meta submission URL)
│   └── data-deletion.html ← Compliance public page (Meta submission URL)
│
├── frontend/          ← Okta kerja di sini (init Sprint 1)
└── backend/           ← Kevin kerja di sini (init Sprint 1)
```

> 📝 **Note:** HTML mockup files ada di ROOT folder, bukan di `mockup/` subfolder. Supaya simpler akses. Jangan edit 13 file `getstarvio-*.html` — treat as visual reference read-only. Re-implement dengan framework pilihan kamu di `frontend/` folder.

## 🗺 Reading Order (MUST)

Setiap dev baca ini berurutan:

### Both (Okta + Kevin) — Day 1 first 2 hours:
1. `docs/shared/README.md` (this file)
2. `docs/shared/ARCHITECTURE.md` — system overview
3. `docs/shared/SPRINT-PLAN.md` — timeline + deadlines
4. `docs/shared/DEPLOYMENT.md` — DO + Vercel setup
5. `docs/shared/ENV-TEMPLATE.md` — environment variables
6. `docs/shared/COMMUNICATION.md` — WA group, meetings, PR rules
7. `prompts/00-global.md` — **MOST IMPORTANT** — schema + business rules
8. `prompts/META-APP-REVIEW.md` — compliance requirements untuk submission

### Okta (Frontend) — rest of Day 1:
1. `docs/okta/00-OVERVIEW.md`
2. `docs/okta/01-STACK-OPTIONS.md` — pick your stack
3. `docs/okta/02-EMBEDDED-SIGNUP.md` — CRITICAL for Meta
4. `docs/okta/03-API-INTEGRATION.md`
5. `docs/okta/04-SPRINT-CHECKLIST.md` — daily tasks

### Kevin (Backend) — rest of Day 1:
1. `docs/kevin/00-OVERVIEW.md`
2. `docs/kevin/01-STACK-OPTIONS.md` — pick your stack
3. `docs/kevin/02-DATABASE-SCHEMA.md`
4. `docs/kevin/03-API-CONTRACT.md`
5. `docs/kevin/04-META-INTEGRATION.md` — CRITICAL for Meta
6. `docs/kevin/05-SPRINT-CHECKLIST.md` — daily tasks

## 📌 The Hard Truth

- **Mockup itu BUKAN production code** — localStorage everything, zero backend. Kalian rewrite semuanya.
- **Spec di `prompts/` adalah canonical** — kalau mockup kontradiksi dengan spec, spec wins.
- **Meta reviewer akan test live app** — harus ada REAL Meta API integration, bukan mock.
- **Path C strategy** — review submit dulu (apa adanya), launch features tambahan paralel dengan review wait.

## 🆘 Blockers & Questions

- **Non-technical questions** (business logic, UX, priorities): tanya via WA group, owner Sebastian akan respond.
- **Technical decisions** (framework, library, approach): pair diskusi sendiri antara Okta ↔ Kevin, agree in WA group.
- **Meta API behavior** tidak clear: check Meta docs dulu, kalau masih bingung post di WA group dengan link + screenshot.

## ⚡ Day 1 Tuntutan (20 April 2026 Senin)

**Pagi hari (mulai 09:00 WIB):**
- [ ] Baca semua doc di list atas
- [ ] Pilih tech stack (baca `01-STACK-OPTIONS.md`)
- [ ] Setup repo (clone, branch)
- [ ] Setup DO droplet (Kevin) + Vercel account (Okta)

**Malam 20:00 WIB — Meeting #1 (WA video call):**
- Stack pilihan finalize
- Repo + infra status
- Sprint 1 assign tasks
- Blockers

**Target akhir minggu 1 (Senin 27 Apr):**
- Google OAuth working end-to-end
- Database schema deployed
- Basic API endpoints stubbed
- FB SDK integrated (Embedded Signup mockup working)

## 🎯 North Star

Deadline submit: **29 April 23:59 WIB**. Kalau miss, Meta review mundur minggu depan → beta launch mundur. Semua keputusan dev harus saring lewat pertanyaan: "Apakah ini bisa bikin kita miss 29 April?" Kalau iya, cari shortcut atau defer ke Sprint 3.

Good luck, let's ship this 🚀
