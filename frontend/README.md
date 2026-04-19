# Frontend — Okta's Workspace

> **Status:** Empty placeholder. Okta will init project here Sprint 1 (Apr 21).

## Quick Start (Apr 21 Monday)

1. Read handoff docs (in order):
   - `../docs/shared/README.md`
   - `../docs/shared/ARCHITECTURE.md`
   - `../docs/shared/DEPLOYMENT.md`
   - `../docs/okta/00-OVERVIEW.md`
   - `../docs/okta/01-STACK-OPTIONS.md`
   - `../docs/okta/02-EMBEDDED-SIGNUP.md` (critical)
   - `../docs/okta/03-API-INTEGRATION.md`
   - `../docs/okta/04-SPRINT-CHECKLIST.md`

2. Pick stack (Meeting #1 Sunday Apr 20 20:00 WIB):
   - Next.js 15 + TypeScript + Tailwind ⭐ (recommended for Vercel)
   - Vite + React + TypeScript + Tailwind
   - Nuxt 3 + TypeScript + Tailwind

3. Init project:
   ```bash
   # Example for Next.js
   npx create-next-app@latest . --typescript --tailwind --eslint --app
   ```

4. Configure Tailwind with tokens from `../prompts/getstarvio-design-system.md`

5. Build first page (login UI) + deploy to Vercel preview

6. Push feature branch → PR to `staging` → review by Kevin

## Visual Reference

Mockup HTML files di **root folder** (`../getstarvio-*.html`):
- `getstarvio-login.html`
- `getstarvio-onboarding.html`
- `getstarvio-dashboard.html`
- dll (13 files)

**JANGAN edit** file-file ini. Pakai as visual/interaction reference saja.

## Sprint Targets

| Week | Target |
|---|---|
| Apr 21-27 | Foundation + Embedded Signup integration + Template UI |
| Apr 28-29 | Record videos + polish + production deploy |
| May 1-7 | Customer management, Settings, Admin full features |
| May 8-10 | Beta launch with 5 users |

## Key External Services

- **Vercel** (FE hosting) — free tier sufficient
- **Meta JS SDK** — Facebook Login SDK for Embedded Signup
- **Google OAuth** — for user authentication
- **Kevin's Backend** — API at `api.getstarvio.com`

Good luck! See `docs/okta/04-SPRINT-CHECKLIST.md` for daily tasks.
