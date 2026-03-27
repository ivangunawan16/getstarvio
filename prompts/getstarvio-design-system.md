# getstarvio UI/UX Design System Prompt
**Version 2 — Source of truth for all page builds and redesigns**

> Paste this prompt at the start of every Claude Code session that touches getstarvio HTML. It tells the AI exactly which design tokens, components, and layout rules to use so the visual language stays locked across all pages.

---

## ROLE

You are building pages for **getstarvio** — a WhatsApp-based customer return reminder SaaS for Indonesian beauty/wellness SMBs. Every page must strictly follow this design system. **Do not invent new colors, fonts, radii, or component variants** that are not defined here. If a design decision is not covered, ask before deciding.

---

## 1. CSS VARIABLES — ALWAYS USE THESE, NEVER HARDCODE

```css
:root {
  /* Backgrounds */
  --bg:     #f7f6f2;   /* page background */
  --bg2:    #fff;      /* card / sidebar / topbar surfaces */
  --bg3:    #f0efe9;   /* subtle hover / input fill */
  --bg4:    #e8e7e0;   /* deeper muted fill (progress track, etc.) */

  /* Borders */
  --border:  #e2e1d9;  /* default border */
  --border2: #cccbc2;  /* stronger border (focus ring, select) */

  /* Text */
  --ink:  #1a1917;     /* primary text */
  --ink2: #5c5b55;     /* secondary text */
  --ink3: #9b9a92;     /* muted / labels */
  --ink4: #c2c1b8;     /* disabled / very muted */

  /* Brand — Lime */
  --lime:    #b8f04a;  /* primary accent (buttons, active nav) */
  --lime2:   #9fd93a;  /* lime hover / darker variant */
  --lime-dk: #2d4a00;  /* text on lime background */
  --lime-bg: #edfac8;  /* light lime tint (status badge bg, found card) */

  /* Semantic — Amber (warning / mendekati) */
  --amber:    #f5a623;
  --amber-bg: #fff4e0;
  --amber-dk: #7a4f00;

  /* Semantic — Red (danger / hilang / critical) */
  --red:    #e8453c;
  --red-bg: #fde8e7;
  --red-dk: #7a1a16;

  /* Semantic — Blue (info / links / intervals) */
  --blue:    #2563eb;
  --blue-bg: #eff4ff;
  --blue-dk: #1e3a8a;

  /* Shape */
  --r:       12px;   /* default border-radius */
  --r-sm:    8px;    /* small: inputs, buttons, nav items */
  --r-lg:    16px;   /* large: modals, greeting card */

  /* Layout */
  --sidebar: 224px;
}
```

---

## 2. TYPOGRAPHY

| Use | Font | Weight | Size |
|---|---|---|---|
| Body, UI, labels | `'Sora', sans-serif` | 400, 500, 600, 700 | varies |
| Numbers, codes, WA numbers, intervals | `'JetBrains Mono', monospace` | 400, 500 | varies |

**Google Fonts import — always include this in `<head>`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Typography rules:**
- `font-family: 'Sora', sans-serif` on `button` and `body` — always
- Section titles: `14px font-weight:600 color:var(--ink)`
- Page titles (topbar): `16px font-weight:700 color:var(--ink)`
- Labels (uppercase small caps): `10–11px font-weight:600 text-transform:uppercase letter-spacing:0.6–0.8px color:var(--ink3 or --ink4)`
- Body/row text: `13px color:var(--ink)`
- Subtext / muted: `11–12px color:var(--ink3)`
- Large metric numbers: `32px font-family:JetBrains Mono font-weight:700`
- Greeting tile numbers: `26px font-family:JetBrains Mono font-weight:700 color:var(--lime)`

---

## 3. GLOBAL RESET

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
a { color: inherit; text-decoration: none; }
button { font-family: 'Sora', sans-serif; cursor: pointer; border: none; outline: none; }
body { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--ink); }
```

---

## 4. LAYOUT — SIDEBAR PAGES

Pages with full navigation use this shell:

```
body { display:flex; height:100vh; overflow:hidden; }
  └── .sidebar        (224px wide, bg2, border-right)
  └── .main           (flex:1, flex-direction:column)
        └── .topbar   (60px tall, bg2, border-bottom)
        └── .content  (flex:1, overflow-y:auto, padding:28px)
              └── .content-inner (max-width:960px, margin:0 auto, display:flex, flex-direction:column, gap:24px)
```

**Sidebar rules:**
```css
.sidebar {
  width: var(--sidebar); min-width: var(--sidebar);
  background: var(--bg2);           /* LIGHT sidebar — NOT dark */
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  height: 100vh; overflow-y: auto;
}
```

**Sidebar logo zone:**
```css
.sidebar-logo { padding: 20px 20px 16px; border-bottom: 1px solid var(--border); }
.logo-text { font-size:18px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
.logo-text span { color: var(--lime-dk); }   /* "vio" in getstarvio is lime-dk */
.biz-name { font-size:11px; color:var(--ink3); margin-top:2px; }
```

**Nav items:**
```css
.nav-item {
  display:flex; align-items:center; gap:9px;
  padding:8px 10px; border-radius:var(--r-sm);
  font-size:13px; font-weight:500; color:var(--ink2);
  transition:background 0.15s, color 0.15s; margin-bottom:2px;
}
.nav-item:hover  { background:var(--bg3); color:var(--ink); }
.nav-item.active { background:var(--lime); color:var(--lime-dk); font-weight:600; }
.nav-icon { font-size:15px; width:18px; text-align:center; flex-shrink:0; }
```

Nav section structure:
```html
<nav class="nav-section" style="flex:1">
  <div class="nav-label">Menu</div>
  <a href="getstarvio-dashboard.html"      class="nav-item [active]"><span class="nav-icon">🏠</span>Dashboard</a>
  <a href="getstarvio-catat-kunjungan.html"      class="nav-item"><span class="nav-icon">📋</span>Catat Kunjungan</a>
  <a href="getstarvio-pelanggan.html"      class="nav-item"><span class="nav-icon">👥</span>Pelanggan</a>
  <a href="getstarvio-automation.html"     class="nav-item"><span class="nav-icon">🤖</span>Automation</a>
  <a href="getstarvio-log-reminder.html"   class="nav-item"><span class="nav-icon">📜</span>Log Reminder</a>
  <a href="getstarvio-kategori.html"       class="nav-item"><span class="nav-icon">🏷️</span>Kategori</a>
  <a href="getstarvio-billing.html"        class="nav-item"><span class="nav-icon">💳</span>Billing</a>
  <a href="getstarvio-command-center.html" class="nav-item"><span class="nav-icon">⚡</span>Command Center</a>
</nav>
```

**Sidebar footer:**
```css
.sidebar-footer { margin-top:auto; padding:12px; border-top:1px solid var(--border); }
.sidebar-footer button { width:100%; padding:8px; border-radius:var(--r-sm); background:var(--bg3); color:var(--ink2); font-size:12px; }
.logout-btn { background:var(--red-bg); color:var(--red-dk); }
.logout-btn:hover { background:#fbd0ce; }
```

**Topbar:**
```css
.topbar {
  background:var(--bg2); border-bottom:1px solid var(--border);
  padding:0 28px; height:60px;
  display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
}
.page-title { font-size:16px; font-weight:700; color:var(--ink); }
.page-sub   { font-size:12px; color:var(--ink3); margin-top:1px; }
```

---

## 5. COMPONENTS

### 5.1 Buttons

```css
/* Primary — lime */
.btn-lime {
  background:var(--lime); color:var(--lime-dk);
  font-weight:600; font-size:13px;
  padding:8px 18px; border-radius:var(--r-sm);
  transition:background 0.15s;
}
.btn-lime:hover { background:var(--lime2); }

/* Full-width (modal actions) */
.btn-full { width:100%; padding:11px; border-radius:var(--r-sm); font-size:14px; font-weight:600; }
.btn-full.lime { background:var(--lime); color:var(--lime-dk); }
.btn-full.lime:hover { background:var(--lime2); }
.btn-full.lime:disabled { opacity:0.45; cursor:not-allowed; }

/* Outline */
.btn-outline {
  padding:9px 20px; border-radius:var(--r-sm);
  border:1.5px solid var(--border2);
  background:var(--bg2); color:var(--ink2);
  font-size:13px; font-weight:500;
}
.btn-outline:hover { border-color:var(--ink); background:var(--bg3); }
```

### 5.2 Metric Cards

```css
.metrics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.metric-card  { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:18px 20px; }
.mc-label { font-size:11px; font-weight:600; color:var(--ink3); text-transform:uppercase; letter-spacing:0.6px; }
.mc-num   { font-size:32px; font-weight:700; font-family:'JetBrains Mono',monospace; margin-top:6px; line-height:1; }
.mc-sub   { font-size:11px; color:var(--ink3); margin-top:4px; }

/* Color variants — top accent stripe */
.metric-card.lime    { border-top:3px solid var(--lime);    } .metric-card.lime    .mc-num { color:var(--lime-dk);  }
.metric-card.amber   { border-top:3px solid var(--amber);   } .metric-card.amber   .mc-num { color:var(--amber-dk); }
.metric-card.red     { border-top:3px solid var(--red);     } .metric-card.red     .mc-num { color:var(--red-dk);   }
.metric-card.blue    { border-top:3px solid var(--blue);    } .metric-card.blue    .mc-num { color:var(--blue-dk);  }
.metric-card.neutral { border-top:3px solid var(--border2); } .metric-card.neutral .mc-num { color:var(--ink);      }
```

### 5.3 Section Cards

```css
.section-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; }
.section-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border); }
.section-title  { font-size:14px; font-weight:600; color:var(--ink); }
.section-link   { font-size:12px; color:var(--blue); font-weight:500; }
.section-link:hover { text-decoration:underline; }
```

### 5.4 Status Badges

Customer return status is derived from: `pct = daysSinceVisit / intervalDays * 100`

| Status | Condition | Badge CSS class |
|---|---|---|
| Aktif | pct < 70 | `.status-badge.aktif` → `bg:var(--lime-bg) color:var(--lime-dk)` |
| Mendekati | 70 ≤ pct < 100 | `.status-badge.mendekati` → `bg:var(--amber-bg) color:var(--amber-dk)` |
| Hilang | pct ≥ 100 | `.status-badge.hilang` → `bg:var(--red-bg) color:var(--red-dk)` |

```css
.status-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:20px; font-size:11px; font-weight:600; }
.status-badge.aktif    { background:var(--lime-bg);  color:var(--lime-dk);  }
.status-badge.mendekati{ background:var(--amber-bg); color:var(--amber-dk); }
.status-badge.hilang   { background:var(--red-bg);   color:var(--red-dk);   }
```

### 5.5 Progress Bar

```css
.progress-bar  { width:90px; height:4px; background:var(--bg4); border-radius:2px; overflow:hidden; }
.progress-fill { height:100%; border-radius:2px; transition:width 0.3s; }
.progress-fill.aktif    { background:var(--lime2); }
.progress-fill.mendekati{ background:var(--amber); }
.progress-fill.hilang   { background:var(--red);   }
```

### 5.6 Badges (count chips)

```css
.badge { display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; padding:0 7px; border-radius:20px; font-size:11px; font-weight:700; font-family:'JetBrains Mono',monospace; }
.badge.amber { background:var(--amber-bg); color:var(--amber-dk); }
.badge.blue  { background:var(--blue-bg);  color:var(--blue-dk);  }
.badge.lime  { background:var(--lime-bg);  color:var(--lime-dk);  }
.badge.red   { background:var(--red-bg);   color:var(--red-dk);   }
```

### 5.7 Avatar

```css
.avatar { width:36px; height:36px; border-radius:50%; background:var(--lime); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--lime-dk); flex-shrink:0; }
/* Small variant in autocomplete */
.ac-avatar { width:30px; height:30px; font-size:11px; }
```
Avatar text = first letter of name, uppercase.

### 5.8 Customer Row

```css
.cx-row { display:flex; align-items:center; gap:14px; padding:12px 20px; border-bottom:1px solid var(--border); }
.cx-row:last-child { border-bottom:none; }
.cx-info { flex:1; min-width:0; }
.cx-name { font-size:13px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cx-services { font-size:11px; color:var(--ink3); margin-top:2px; }
.cx-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; min-width:100px; }
```

### 5.9 Greeting Card

```css
.greeting-card { background:var(--ink); border-radius:var(--r-lg); padding:28px 32px; color:#fff; display:flex; align-items:center; justify-content:space-between; gap:24px; }
.greeting-text { font-size:22px; font-weight:700; color:#fff; line-height:1.2; }
.greeting-date { font-size:13px; color:rgba(255,255,255,0.55); margin-top:6px; }
.greeting-tiles { display:flex; gap:12px; }
.greeting-tile { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:var(--r); padding:14px 20px; min-width:120px; text-align:center; }
.tile-num   { font-size:26px; font-weight:700; color:var(--lime); font-family:'JetBrains Mono',monospace; }
.tile-label { font-size:11px; color:rgba(255,255,255,0.55); margin-top:3px; }
```

### 5.10 WA Connection Chip (topbar)

```css
.wa-chip { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:500; border:1px solid var(--border); background:var(--bg2); }
.wa-chip.aktif   { background:var(--lime-bg); border-color:#9fd93a; color:var(--lime-dk); }
.wa-chip.terputus{ background:var(--red-bg);  border-color:#f5a0a0; color:var(--red-dk);  }
.wa-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.wa-chip.aktif .wa-dot { background:var(--lime2); animation:pulse-lime 1.8s infinite; }
.wa-chip.terputus .wa-dot { background:var(--red); }
@keyframes pulse-lime { 0%,100%{box-shadow:0 0 0 0 rgba(159,217,58,0.5)} 50%{box-shadow:0 0 0 4px rgba(159,217,58,0)} }
```

### 5.11 Modal

```css
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; opacity:0; pointer-events:none; transition:opacity 0.2s; }
.modal-overlay.open { opacity:1; pointer-events:all; }
.modal-box { background:var(--bg2); border-radius:var(--r-lg); width:100%; max-width:480px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.25); transform:translateY(10px); transition:transform 0.2s; }
.modal-overlay.open .modal-box { transform:translateY(0); }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid var(--border); }
.modal-title  { font-size:16px; font-weight:700; color:var(--ink); }
.modal-close  { width:30px; height:30px; border-radius:50%; background:var(--bg3); color:var(--ink2); font-size:16px; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
.modal-close:hover { background:var(--bg4); }
.modal-body   { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }
.modal-actions{ display:flex; flex-direction:column; gap:8px; }
```

Open/close modal with JS:
```js
function openModal(id)  { document.getElementById(id).classList.add('open');    document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }
```

### 5.12 Form Inputs

```css
/* Text / name inputs */
.name-input, .phone-input, .date-input {
  width:100%; padding:9px 12px; border-radius:var(--r-sm);
  border:1.5px solid var(--border); background:var(--bg2);
  color:var(--ink); font-size:13px; font-family:'Sora',sans-serif;
  transition:border-color 0.15s;
}
.name-input:focus, .phone-input:focus, .date-input:focus {
  outline:none; border-color:var(--lime2);
}
.input-label { font-size:12px; font-weight:600; color:var(--ink2); margin-bottom:5px; }
```

### 5.13 Autocomplete Dropdown

```css
.autocomplete-dropdown { position:absolute; top:calc(100% + 4px); left:0; right:0; background:var(--bg2); border:1.5px solid var(--border2); border-radius:var(--r); box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:10; display:none; overflow:hidden; }
.autocomplete-dropdown.show { display:block; }
.ac-item { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; transition:background 0.1s; border-bottom:1px solid var(--border); }
.ac-item:last-child { border-bottom:none; }
.ac-item:hover { background:var(--bg3); }
.ac-name  { font-size:12px; font-weight:600; color:var(--ink); }
.ac-wa    { font-size:11px; color:var(--ink3); font-family:'JetBrains Mono',monospace; }
.ac-action{ font-size:11px; color:var(--blue); font-weight:500; }
```

### 5.14 Checklist (service selector)

```css
.check-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--r-sm); border:1.5px solid var(--border); background:var(--bg2); cursor:pointer; transition:border-color 0.15s,background 0.15s; }
.check-item:hover   { border-color:var(--border2); background:var(--bg3); }
.check-item.checked { border-color:var(--lime2); background:var(--lime-bg); }
.check-box { width:18px; height:18px; border-radius:4px; border:1.5px solid var(--border2); background:var(--bg2); }
.check-item.checked .check-box { border-color:var(--lime2); background:var(--lime2); }
```

### 5.15 Empty State Card

```css
.empty-card  { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r-lg); padding:40px 32px; text-align:center; }
.empty-icon  { font-size:40px; margin-bottom:16px; }
.empty-title { font-size:16px; font-weight:700; color:var(--ink); margin-bottom:8px; }
.empty-sub   { font-size:13px; color:var(--ink3); line-height:1.6; max-width:360px; margin:0 auto 24px; }
```

### 5.16 Quick Link Cards

```css
.quick-links { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.quick-link-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:16px 18px; display:flex; align-items:center; gap:12px; transition:border-color 0.15s,background 0.15s; }
.quick-link-card:hover { border-color:var(--border2); background:var(--bg3); }
.quick-link-icon  { font-size:20px; width:36px; height:36px; background:var(--bg3); border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.quick-link-label { font-size:13px; font-weight:600; color:var(--ink); }
.quick-link-sub   { font-size:11px; color:var(--ink3); margin-top:2px; }
```

### 5.17 Interval / Monospace Chip

```css
.rm-interval { font-size:11px; font-family:'JetBrains Mono',monospace; color:var(--blue-dk); background:var(--blue-bg); padding:2px 8px; border-radius:20px; white-space:nowrap; }
```

---

## 6. CREDIT / BILLING STATE SYSTEM

Credit balance drives UI color theme across billing-related elements:

| State | Condition | Color | Behavior |
|---|---|---|---|
| Healthy | kredit ≥ 30 | `--lime` | Normal |
| Low | 10 ≤ kredit < 30 | `--amber` | Amber warning chip |
| Critical | 1 ≤ kredit < 10 | `--red` | Red + pulse animation |
| Empty | kredit = 0 | `--ink` dark | Automation paused, dark chip |

The credit chip in the topbar must reflect this state dynamically on every page.

---

## 7. DATA LAYER — localStorage

**Key:** `getstarvio_user` (single JSON object, `JSON.parse/stringify`)

**Schema:**
```js
{
  bizName: string,
  bizType: string,         // "salon" | "spa" | "klinik" | etc.
  bizSlug: string,
  adminName: string,
  adminEmail: string,
  ownerWa: string,
  waNum: string,
  timezone: string,
  country: string,
  remLeft: number,         // credits remaining
  remMax: number,          // total credits purchased
  defaultInterval: number, // days
  cats: [{ id, name, icon, interval, templateId, templateBody }],
  customers: [{
    id, name, wa, via,
    services: [{ name, icon, date, days }]  // multi-service per customer
  }],
  reminders: [{ id, cxId, cxName, svc, scheduledAt, sentAt, status, kredit }]
}
```

**Customer status per service** (compute at render time, never store):
```js
function getStatus(service) {
  const diff = Math.floor((Date.now() - new Date(service.date)) / 86400000);
  const pct  = (diff / service.days) * 100;
  if (pct >= 100) return 'hilang';
  if (pct >= 70)  return 'mendekati';
  return 'aktif';
}
```

**Worst-case status for a customer** (use for table rows):
```js
function worstStatus(customer) {
  const order = { hilang:0, mendekati:1, aktif:2 };
  return customer.services.reduce((worst, svc) => {
    const s = getStatus(svc);
    return order[s] < order[worst] ? s : worst;
  }, 'aktif');
}
```

---

## 8. PAGE NAVIGATION MAP

All pages link to each other via their sidebar (or topbar on pages without full sidebar). The `nav-item.active` class must match the current page.

| File | Page Title | Nav Label |
|---|---|---|
| `getstarvio-login.html` | Login | (no nav) |
| `getstarvio-onboarding.html` | Onboarding | (no nav) |
| `getstarvio-dashboard.html` | Dashboard | Dashboard |
| `getstarvio-catat-kunjungan.html` | Catat Kunjungan | Catat Kunjungan |
| `getstarvio-pelanggan.html` | Pelanggan | Pelanggan |
| `getstarvio-automation.html` | Automation | Automation |
| `getstarvio-log-reminder.html` | Log Reminder | Log Reminder |
| `getstarvio-kategori.html` | Kategori Layanan | Kategori |
| `getstarvio-billing.html` | Billing & Kredit | Billing |
| `getstarvio-command-center.html` | Command Center | Command Center |
| `getstarvio-checkin.html` | QR Check-in | (accessed via catat kunjungan) |

---

## 9. TRANSITIONS & ANIMATIONS

```css
/* Standard hover transition */
transition: background 0.15s, color 0.15s;

/* Modal enter */
transition: opacity 0.2s;           /* overlay */
transition: transform 0.2s;         /* box slides up from translateY(10px) → 0 */

/* WA dot pulse (aktif) */
@keyframes pulse-lime {
  0%,100% { box-shadow: 0 0 0 0 rgba(159,217,58,0.5); }
  50%      { box-shadow: 0 0 0 4px rgba(159,217,58,0); }
}

/* Credit pulse (critical state) */
@keyframes pulse-red {
  0%,100% { box-shadow: 0 0 0 0 rgba(232,69,60,0.4); }
  50%      { box-shadow: 0 0 0 5px rgba(232,69,60,0); }
}
```

---

## 10. RULES — NEVER BREAK THESE

1. **Never use dark sidebar.** Sidebar is always `background:var(--bg2)` (white/light).
2. **Never hardcode hex colors.** Always use CSS variables.
3. **Never use a different font.** Only Sora and JetBrains Mono.
4. **Never use border-radius outside of `--r`, `--r-sm`, `--r-lg`.** Pill shapes use `border-radius:20px` (allowed for badges/chips only).
5. **Never store computed customer status in localStorage.** Always compute from `service.date` and `service.days` at render time.
6. **Always read from `getstarvio_user` in localStorage.** Never rely on hardcoded demo data in production-path code.
7. **Always set `nav-item.active` to match the current page.**
8. **Lime on lime:** text on `var(--lime)` background must always be `var(--lime-dk)` — never white, never black.
9. **JetBrains Mono for numbers:** all stat numbers, WA numbers, kredit counts, and interval values use `font-family:'JetBrains Mono',monospace`.
10. **Content max-width:** always wrap page content in `.content-inner` with `max-width:960px; margin:0 auto`.

---

*This file is the canonical design source for getstarvio. Update it when version 3 changes are approved — not before.*
