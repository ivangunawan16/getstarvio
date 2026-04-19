# Frontend Stack Options

**Tidak ada pilihan "benar"** — semua 3 OK untuk project ini. Pilih yang paling kamu produktif.

## Decision Matrix

| Factor | Next.js 15 | Vite + React | Nuxt 3 |
|---|---|---|---|
| Base framework | React + App Router | React (plain) | Vue 3 |
| TypeScript | ✅ First-class | ✅ First-class | ✅ First-class |
| SSR/SSG | ✅ Both | ❌ SPA only | ✅ Both |
| Bundle size (base) | Medium | Small | Medium |
| Dev speed (HMR) | Fast | Fastest | Fast |
| Learning curve (kalau baru) | Medium | Low | Medium |
| Deployment on Vercel | ⭐ Optimal (native) | ✅ Good | ✅ Good |
| Deployment on DO droplet | ✅ Good | ⭐ Optimal (static build) | ✅ Good |
| File-based routing | ✅ Yes | ❌ Need react-router | ✅ Yes |
| API routes (built-in proxy) | ✅ Yes | ❌ Need separate server | ✅ Yes |
| Ecosystem size | Huge | Huge | Medium |
| Meta SDK compat | ✅ Tested | ✅ Tested | ✅ Tested |
| Total install size | ~200MB | ~80MB | ~150MB |

## Recommended: **Next.js 15 + TypeScript + Tailwind**

Why:
- Vercel-optimized (free tier works perfectly)
- App Router has nice patterns for auth (server components + client boundary)
- API routes berguna untuk BFF pattern (proxy calls to Kevin's backend with session)
- Biggest ecosystem (kalau cari library apapun, ada)
- SSR opsional — pakai 'use client' untuk pages yang interactive

Base setup:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
npm install
```

Recommended additional libs:
```bash
# Facebook SDK loader (TypeScript-safe)
npm install react-facebook

# HTTP client
npm install axios
# or use native fetch — also fine

# Form handling
npm install react-hook-form zod @hookform/resolvers

# UI icons (kalau butuh, opsional — mockup pakai inline SVG)
npm install lucide-react

# Testing (E2E)
npm install --save-dev @playwright/test
npx playwright install chromium

# Linter/formatter
npm install --save-dev prettier eslint-config-prettier
```

## Alternative 1: Vite + React + TypeScript + Tailwind

Why pilih ini:
- Ga butuh SSR (SaaS internal, SEO bukan concern)
- Faster dev experience (HMR super cepat)
- Smaller bundle (kalau deploy ke DO droplet as static, bandwidth hemat)
- Ga ada "magic" Next.js routing/caching yang bisa bingungin

Base setup:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Tambahan:
```bash
npm install react-router-dom axios react-hook-form zod
npm install -D @playwright/test prettier
```

Catatan: Auth flow harus di client-side (no SSR cookie magic) — pakai JWT dalam localStorage atau ambil dari cookie via API.

## Alternative 2: Nuxt 3 + TypeScript + Tailwind

Why pilih ini:
- Kalau kamu lebih nyaman dengan Vue
- API routes built-in juga (nitro server)
- Dev experience bagus

Base setup:
```bash
npx nuxi@latest init frontend
cd frontend
npm install
npx nuxi module add tailwindcss
```

Tambahan:
```bash
npm install axios @vee-validate/nuxt zod
npm install -D @playwright/test prettier
```

## Stack-Agnostic Requirements

Regardless of framework, you MUST:

### Style
- Use Tailwind CSS
- Config Tailwind dengan tokens dari `mockup/getstarvio-design-system.md`
- Color palette: lime (`#b8f04a`), lime-dk (`#2d4a00`), ink (`#1a1917`), bg (`#f7f6f2`), dll
- Font: `Sora` (body) + `JetBrains Mono` (numbers/code)
- Border radius: 12px default, 8px small, 16px large, 20px pills

### Libraries needed (regardless of framework)
- **HTTP client** — axios or native fetch
- **Form validation** — Zod (universal) + react-hook-form / vee-validate
- **Date** — `date-fns` (treeshakable, lebih ringan dari moment.js)
- **Clipboard** — native `navigator.clipboard.writeText()` (no lib needed)
- **Testing** — Playwright for E2E (Cypress also OK)

### Facebook JS SDK
Semua framework pakai approach yang sama:
```html
<!-- Load script async -->
<script async defer crossorigin="anonymous"
  src="https://connect.facebook.net/en_US/sdk.js"></script>
```

Init di app startup:
```js
window.fbAsyncInit = function() {
  FB.init({
    appId: process.env.NEXT_PUBLIC_META_APP_ID,
    cookie: true,
    xfbml: false,
    version: process.env.NEXT_PUBLIC_META_API_VERSION,
  })
}
```

Details di `02-EMBEDDED-SIGNUP.md`.

## Decision Point

**Pick 1 stack by Monday Apr 20 20:00 WIB Meeting #1.**

Kriteria:
1. **Speed to first deploy** — which one you can get "hello world" on Vercel fastest?
2. **Comfort** — yang mana kamu paling smooth tulis
3. **Ecosystem** — library availability yang kamu butuh

Commit decision di Meeting #1 + post di WA group. Ga ada balik lagi — stick dengan pilihan sampai selesai.

## Project Structure (recommended)

Terlepas dari framework, struktur folder:

```
frontend/
├── src/                    (or app/ for Next.js App Router)
│   ├── components/         (reusable UI)
│   │   ├── ui/             (primitive: Button, Input, Modal, etc.)
│   │   └── feature/        (domain: CustomerCard, TemplateForm, etc.)
│   ├── pages/              (or app/ routes for Next.js)
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── onboarding.tsx
│   │   ├── admin/
│   │   └── settings.tsx
│   ├── lib/                (utilities)
│   │   ├── api.ts          (axios instance with auth interceptor)
│   │   ├── auth.ts         (useAuth hook)
│   │   ├── meta-sdk.ts     (Facebook SDK wrapper)
│   │   └── utils.ts
│   ├── hooks/              (React hooks)
│   ├── types/              (TypeScript types)
│   │   └── api.ts          (from OpenAPI codegen atau manual)
│   └── styles/
│       └── globals.css
├── public/                 (static assets — logos, icons)
├── tests/e2e/              (Playwright tests)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts          (or vite.config.ts / nuxt.config.ts)
├── .env.local              (gitignored)
├── .env.example            (committed)
└── package.json
```

## Code Quality Tools

```bash
# Add to package.json scripts:
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && tsc --noEmit",
    "format": "prettier --write ./src",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}

# Pre-commit hook (optional but recommended)
npm install -D husky lint-staged
npx husky init

# .lintstagedrc
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

## First Things to Do

After pick stack, Monday Apr 21 morning:

1. `git clone` repo → branch `feature/fe-init`
2. `cd frontend` (create folder if not exist)
3. Run framework init command
4. Config Tailwind dengan design tokens dari mockup
5. Build 1 simple page (e.g. login UI only, no logic)
6. Deploy to Vercel preview
7. Commit + PR → review oleh Kevin

**Success criteria:** Vercel preview URL live, shows login page styled correctly.

Next step: `02-EMBEDDED-SIGNUP.md` — the most critical piece of work.
