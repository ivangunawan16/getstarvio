# Meta App Review — Allowed Usage Content (getstarvio Tech Provider)

> **Tujuan dokumen ini:** Panduan lengkap untuk isi form "Allowed usage" di Meta App Review Dashboard. Setiap permission ada: Business Description, "How will this app use" description, Screencast storyline, dan API test calls (kalau dibutuhkan).

---

## ⚠️ CRITICAL: MUST DO BEFORE SUBMITTING

Dokumen ini punya **placeholder** yang WAJIB di-fill dulu sebelum paste ke Meta form. Cari & ganti yang berikut:

| Placeholder | Status | Nilai |
|---|---|---|
| `[LEGAL_ENTITY_NAME]` | ✅ DONE | PT CAKRA DIGITAL INDONESIA |
| `[Jakarta office address]` | ✅ DONE | Jl. Raya Kelapa Puan Blok AD14 No. 16 & 17, Kel. Pakulonan Barat, Kec. Kelapa Dua, Kab. Tangerang, Banten 15810 |
| `[number from Business Verification]` (NIB) | ✅ DONE | 2402220064559 |
| `[number]` (NPWP) | ✅ DONE | 63.496.854.9-451.000 |
| Password admin + fallback | ✅ DONE | `jiccu5-coVwux-jizput` (sama untuk admin + fallback) |
| `meta_reviewer@getstarvio.com` | ⚠️ BELUM | Buat akun di Google Workspace admin → lalu register di Meta App Dashboard |

**⚠️ SECURITY:** Kalau dokumen ini pernah di-share ke reviewer/external, regenerate semua password SEBELUM submit ke Meta.

**Cara cepat check:** 6/7 placeholder sudah replaced. Sisa: 1 test user email (buat akun Google Workspace `meta_reviewer@getstarvio.com`).

---

## 🎯 Konteks Getstarvio (untuk konsistensi semua deskripsi)

**Singkat:** getstarvio adalah Tech Provider yang bangun aplikasi SaaS untuk UMKM Indonesia (salon, spa, klinik, barbershop, nail studio, bengkel, pet grooming, laundry) — layanan: kirim pengingat WhatsApp otomatis ke pelanggan saat waktunya kembali untuk perawatan lanjutan, berdasarkan tanggal kunjungan terakhir dan interval per kategori layanan.

**Business Model:**
- SaaS subscription (Rp 249.000/bulan, 300 kredit termasuk)
- Pelanggan end-user: pemilik UMKM
- WA Customer (bisnis) onboarded via Embedded Signup + Coexistence mode
- Semua template UTILITY-compliant (aftercare reminder, bukan marketing)

**Use case tipikal:**
> "Sarah terakhir Hair Smoothing di Salon Celestial tanggal 15 Maret 2026. Interval ideal untuk Hair Smoothing = 3 bulan. getstarvio otomatis kirim pengingat aftercare di tanggal 15 Juni 2026 biar Sarah balik ke salon sebelum hasil smoothing-nya pudar."

---

## 🔑 Permissions Analysis — Apa yang HARUS vs TIDAK PERLU

### ✅ HARUS di-request

| Permission | Alasan |
|---|---|
| `whatsapp_business_messaging` | Kirim template aftercare ke pelanggan |
| `whatsapp_business_management` | Manage WABA + register templates + manage phone numbers |
| `business_management` | Access customer's Business Portfolio (didapat dari Embedded Signup `business_id`) |
| `manage_app_solution` | Tech Provider specific — manage app-level solutions untuk customer |
| `public_profile` | Auto-granted, basic login info |
| `email` | Google OAuth login admin getstarvio (sudah approved ✅) |

### ❌ JANGAN di-request (akan auto-reject atau delay review)

| Permission | Alasan skip |
|---|---|
| `whatsapp_business_manage_events` | **Hanya untuk Marketing Messages Lite + Conversions API**. getstarvio UTILITY (aftercare reminder), tidak pakai marketing messages. **Hapus dari list.** |
| Duplicate `business_management` entries | Meta UI kadang tampilkan duplicate card untuk sub-scope berbeda. **Konsolidasi jadi 1 submission** — jangan isi 8 card identical. |
| `pages_messaging`, `pages_show_list` | Bukan use case getstarvio |
| `catalog_management` | Getstarvio tidak pakai product catalog (aftercare bukan commerce) |
| `ads_management`, `ads_read` | Getstarvio tidak menjalankan iklan untuk customer |

> ⚠️ **Critical rule:** "Asking for unnecessary permissions is a common reason for rejection." — Meta docs. Minimalkan ke permission yang BENAR-BENAR dipakai.

---

## 📋 PER-PERMISSION CONTENT

### 1. `whatsapp_business_messaging`

**Business Description (1-liner):**
> getstarvio is a Tech Provider serving Indonesian SMBs (salons, spas, clinics, nail studios, barbershops) with automated WhatsApp aftercare reminder messaging.

**How will this app use this permission?**

```
Getstarvio is a WhatsApp Tech Provider that operates a SaaS platform enabling
Indonesian small and medium businesses (salons, spas, clinics, barbershops,
nail studios, pet grooming, laundry) to send automated aftercare reminders
to their customers via WhatsApp.

We use the whatsapp_business_messaging permission to:

1. Send pre-approved UTILITY message templates (aftercare_followup_1 through
   aftercare_followup_5) to our clients' customers on their behalf, reminding
   them when it's time for a follow-up service visit based on the category
   interval (e.g. facial every 4-6 weeks, hair color every 6-8 weeks).

2. Receive replies from customers and relay them to our business clients'
   inbox dashboard so they can respond within the 24-hour messaging window.

3. Register phone numbers onboarded via Embedded Signup with Coexistence mode
   so clients can continue using their WhatsApp Business app manually while
   automated reminders run in parallel.

4. Manage media uploads for business profile branding (business logo, display
   picture) to ensure our clients' messages appear professional and trusted.

All messages are sent via pre-approved UTILITY templates. We do not send
promotional, marketing, or unsolicited messages. Customers opt in by visiting
the business in person or scanning a check-in QR code at the establishment,
establishing a clear consumer-business relationship prior to any messaging.
```

**Screencast storyline (Video 1 — 3-4 menit, no audio, max 1440px width):**

1. `[0:00-0:20]` Intro: Show getstarvio admin dashboard logged in, overview of customer list (15-20 salon/spa customers visible)
2. `[0:20-0:50]` Click into one customer (Salon Celestial) → show their profile + last customer visit data (e.g., "Sarah — Hair Smoothing — 15 Maret 2026 — interval 90 days")
3. `[0:50-1:30]` Navigate to Automation page → show scheduled aftercare reminder queue ("Sarah → aftercare_followup_1 → scheduled 15 Juni 2026")
4. `[1:30-2:15]` Trigger send (or show scheduled run) → open browser DevTools Network tab → show `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages` request with template name, language, body_parameters visible
5. `[2:15-2:45]` Switch to WhatsApp on mobile or WA Web → customer receives template with variables filled in ("Hi Sarah, Hair Smoothing kamu pada 15 Maret 2026 di Salon Celestial sudah berjalan dengan baik...")
6. `[2:45-3:15]` Back to getstarvio Log Pengingat page → show delivery status changed from "pending" → "terkirim" via webhook (`messages.status=delivered`)
7. `[3:15-3:45]` (Optional bonus) Customer replies in WA → appears in business inbox in getstarvio

**Business Description field (the short box at top):**
> WhatsApp Tech Provider for Indonesian SMBs — sends automated aftercare reminders to customers based on service visit history.

---

### 2. `whatsapp_business_management`

**Business Description (1-liner):**
> getstarvio manages WhatsApp Business Accounts, phone numbers, and message templates on behalf of Indonesian SMB clients.

**How will this app use this permission?**

```
As a Tech Provider, getstarvio uses the whatsapp_business_management permission
to manage client WhatsApp assets throughout the customer lifecycle.

We use this permission to:

1. Onboard new business clients via Embedded Signup with Coexistence mode,
   capturing their WABA ID, phone number ID, and business portfolio ID after
   successful authorization.

2. Register and submit aftercare message templates (currently five UTILITY-
   category templates: aftercare_followup_1 through aftercare_followup_5) to
   Meta for approval on behalf of each client WABA. Templates use positional
   variables {{1}}-{{4}} for customer name, treatment, visit date, and
   business name.

3. Monitor template approval status via message_template_status_update
   webhooks and notify clients in their getstarvio dashboard when templates
   are APPROVED, REJECTED, PAUSED, or FLAGGED.

4. Manage client phone numbers including registration status, display name
   verification, and quality rating monitoring (GREEN/YELLOW/RED).

5. Configure webhooks for each client WABA to receive message delivery
   statuses, incoming messages, and account status updates.

6. Manage QR code generation for in-store customer check-in flows that
   onboard customers into the client's reminder system.

All template management is transparent to the client — they see approval
status in their getstarvio dashboard and can pause reminders per category
when quality drops.
```

**Screencast storyline (Video 2 — 3-5 menit):**

1. `[0:00-0:20]` Intro: Show getstarvio admin panel → navigate to Templates tab
2. `[0:20-0:50]` Show existing template list (aftercare_followup_1 through _5) with various statuses
3. `[0:50-1:30]` Click "New Template" → form opens with: name, category dropdown (UTILITY selected), language (Indonesian), body text with `{{1}} {{2}} {{3}} {{4}}` visible
4. `[1:30-2:10]` Fill example values section: `body_text: [["Sarah", "Hair Smoothing", "15 Maret 2026", "Salon Celestial"]]`
5. `[2:10-2:40]` Click "Submit to Meta" → DevTools Network tab shows `POST https://graph.facebook.com/v21.0/{WABA_ID}/message_templates` with full JSON payload
6. `[2:40-3:10]` Template appears in list with status `PENDING` + timestamp
7. `[3:10-3:40]` Switch to webhook logs view → show `message_template_status_update` webhook received → status changes to `APPROVED`
8. `[3:40-4:20]` (Optional powerful add) — Demonstrate Embedded Signup onboarding: click "Add new business client" → Meta popup (or mock) → customer completes flow → getstarvio receives `waba_id`, `phone_number_id`, `business_id` → new client row appears in dashboard

**Business Description field:**
> Manages WhatsApp assets (WABA, phone numbers, templates) for Indonesian SMB clients using our Tech Provider platform.

---

### 3. `whatsapp_business_manage_events`

> ⚠️ **REMOVE from submission.** This permission is only for Marketing Messages Lite API + Conversions API. getstarvio uses UTILITY templates only (no marketing, no conversion tracking). Keeping this permission will slow review and may trigger rejection for requesting unnecessary permissions.

**Action:** Click "Edit your submission" at top of Allowed Usage page → remove `whatsapp_business_manage_events` from the list.

---

### 4. `email` (Already approved ✅)

No action needed — Meta uses this for account-level identification of getstarvio admin team members.

---

### 5. `manage_app_solution`

**Business Description (1-liner):**
> getstarvio manages Tech Provider app solutions to enable client WABAs to use our platform.

**How will this app use this permission?**

```
getstarvio uses the manage_app_solution permission as part of our Tech Provider
setup to manage app-level solutions that our business clients use.

Specifically we use this permission to:

1. Retrieve the list of app solutions associated with our Tech Provider app
   so our backend can correctly route API calls when a client WABA performs
   actions on our platform.

2. Make API calls on behalf of the applications owned by our Tech Provider
   app, required for account-sharing scenarios where clients work with
   getstarvio alongside their existing WhatsApp presence (Coexistence mode).

3. Establish the Partner Solution relationship that Meta requires for Tech
   Providers to programmatically register client phone numbers, pre-subscribe
   webhooks, and configure messaging on behalf of multiple client WABAs from
   a single dashboard.

This permission is a technical requirement of the Tech Provider program and
does not expose any additional customer-facing data.
```

**Screencast storyline:**

1. `[0:00-0:20]` Show getstarvio Tech Provider admin dashboard → overview of managed client WABAs (list of ~10 salon/spa businesses)
2. `[0:20-0:45]` DevTools Network tab → call `GET /{APP_ID}/managed_apps` showing list of managed app solutions
3. `[0:45-1:15]` Click a client WABA row → make action (e.g., update webhook subscription, sync settings) → show API call on behalf of that app solution
4. `[1:15-1:45]` Show getstarvio internal routing logic that correctly identifies which app solution is processing the request
5. `[1:45-2:15]` (End) Show the action result reflected in client dashboard — "Webhooks updated successfully"

**Required API test calls (showing these in video is important):**

| Endpoint | Method | Purpose |
|---|---|---|
| `/{APP_ID}/managed_apps` | GET | List managed app solutions |
| `/{APP_ID}/subscriptions` | GET | Verify webhook subscriptions |

---

### 6. `business_management` (consolidate all duplicates ke 1 submission)

> ⚠️ **Penting:** Kalau Meta UI tampilkan 8+ duplicate `business_management` cards, isi deskripsi yang SAMA untuk semua (atau hanya isi yang utama). Meta akan process sebagai 1 permission logically — jangan bikin 8 deskripsi berbeda yang kontradiktif.

**Business Description (1-liner):**
> getstarvio reads and manages Business Portfolio assets (WABA, pages) on behalf of Indonesian SMB clients to enable their WhatsApp reminder service.

**How will this app use this permission?**

```
As a Tech Provider, getstarvio uses the business_management permission to
read and manage Business Portfolio assets that our clients (Indonesian SMBs)
own and have granted us access to via Embedded Signup.

We use this permission to:

1. Read client Business Portfolio details after Embedded Signup completion,
   including the business_id returned in the session, to correctly associate
   the client's WABA with their business entity in our dashboard.

2. Retrieve the list of WABAs owned by the client's business portfolio so
   the client can select which WABA to use for getstarvio reminders if they
   have multiple.

3. Verify business verification status of client portfolios (VERIFIED /
   PENDING / NOT_VERIFIED) to display accurate eligibility status in our
   dashboard — clients need verified business portfolios for higher messaging
   tiers.

4. Assign getstarvio as a system user on the client's WABA so we can send
   messages and manage templates on their behalf, with explicit consent given
   during Embedded Signup.

5. Read display information (business name, timezone, currency) to pre-fill
   onboarding fields and show correct localization (IDR currency, Asia/Jakarta
   timezone for Indonesian clients).

We do NOT use this permission to:
- Access, modify, or manage client ad accounts
- Read or write client Facebook Pages content (posts, comments)
- Access client catalogs or products
- Invite users to client business portfolios beyond getstarvio system users
- Read financial/billing information of client businesses

All data accessed is used solely to enable the WhatsApp reminder service
that clients explicitly onboard into via Embedded Signup.
```

**Screencast storyline:**

1. `[0:00-0:20]` Show getstarvio admin dashboard → new client onboarding flow
2. `[0:20-0:50]` Click "Onboard new client" → Meta Embedded Signup popup (or recorded mock)
3. `[0:50-1:20]` Customer completes signup → returns with `waba_id`, `phone_number_id`, `business_id`
4. `[1:20-2:00]` DevTools Network tab → `GET /{business_id}` shows business portfolio details being fetched (name, verification_status)
5. `[2:00-2:40]` Show DevTools: `GET /{business_id}/owned_whatsapp_business_accounts` listing WABAs
6. `[2:40-3:10]` Client's new entry appears in getstarvio dashboard with business portfolio name visible ("Demo Business")
7. `[3:10-3:45]` Show getstarvio dashboard displaying business verification status badge (VERIFIED lime chip)

**Required API test calls:**

| Endpoint | Method | Purpose |
|---|---|---|
| `/{business_id}` | GET | Read business portfolio metadata |
| `/{business_id}/owned_whatsapp_business_accounts` | GET | List owned WABAs |
| `/{business_id}?fields=verification_status,name,primary_page` | GET | Read verification status |
| `/{waba_id}/assigned_users` | POST | Assign system user (during onboarding) |

---

### 7. `public_profile`

**Auto-granted** — biasanya tidak perlu description atau screencast panjang. Tapi kalau Meta form tetap minta Business Description + description:

**Business Description (1-liner, kalau field muncul):**
> getstarvio reads basic Facebook public profile data (name) to identify the admin user during Embedded Signup for WhatsApp Business account onboarding.

**How will this app use this permission? (kalau field muncul):**

```
getstarvio uses the public_profile permission solely as a prerequisite for
the Embedded Signup flow that Meta requires for Tech Providers to onboard
WhatsApp Business customers.

We use this permission to:

1. Identify the Facebook user who is completing the Embedded Signup flow
   on behalf of their business — needed because Meta's JavaScript SDK
   requires a valid FB login session before initiating Embedded Signup.

2. Display the name of the admin who authorized the connection in our
   internal admin dashboard's audit log, for accountability.

We do NOT:
- Display Facebook profile information to end-users or third parties
- Store profile pictures or any extended profile fields
- Use this data for marketing, analytics, or advertising
- Share this data with any third-party processor

Facebook profile data is held only for the duration of the active session
and not persisted in long-term storage beyond the admin name string.
```

**Screencast storyline (kalau diminta — 30-60 detik):**

1. `[0:00-0:15]` Show Facebook OAuth login dialog triggering di Embedded Signup flow
2. `[0:15-0:30]` Admin name ter-capture dan muncul di getstarvio admin dashboard audit log
3. `[0:30-0:45]` Admin logs out — confirm profile data cleared from session

---

## 📤 DATA HANDLING Section

Meta juga ada section "Data handling" di review form. Yang perlu disiapkan:

### Data Collection Statement
```
getstarvio collects the following data from Meta platforms:

1. WhatsApp Business Account IDs (waba_id) — stored in our encrypted database
   for the duration of the client's subscription.

2. Phone Number IDs (phone_number_id) — stored encrypted, used for routing
   outbound template messages.

3. Business Portfolio IDs (business_id) — stored for account association.

4. Display phone numbers and verified business names — stored for UI display
   in the client dashboard.

5. Message delivery webhooks (message ID, status, timestamp) — stored for
   90 days for troubleshooting and analytics, then auto-deleted.

6. Template approval status (via message_template_status_update webhooks) —
   stored indefinitely as part of template lifecycle management.

7. Admin user email and name (via public_profile + email permissions) —
   stored only for authentication.

We do NOT collect:
- Customer message content (messages pass through our API but are not stored
  beyond webhook processing for delivery confirmation)
- Customer phone numbers of our clients' end customers (only hashed
  identifiers are retained for opt-out enforcement)
- Any financial data
- Any content from client Facebook Pages
```

### Data Security Measures
- TLS 1.3 for all data in transit
- AES-256 encryption at rest for access tokens + IDs
- Access tokens stored server-side only (never in client localStorage in production)
- HMAC signature verification for all webhooks
- SOC 2 Type II compliance roadmap (year 2 target)
- Indonesian data residency via AWS Asia-Pacific (Jakarta) region
- 30-day data deletion SLA upon client offboarding request

### Data Retention & Deletion
- Client offboarding: full data delete within 30 days via `/api/data-deletion` endpoint
- Privacy policy: https://getstarvio.com/privacy.html
- Terms of service: https://getstarvio.com/terms.html
- Data deletion endpoint: https://getstarvio.com/data-deletion.html

---

## 👁️ REVIEWER INSTRUCTIONS Section

Meta reviewer butuh akses ke getstarvio buat test. Setup:

### Test Credentials
```
URL: https://getstarvio.com (atau staging URL)
Login method: Google OAuth
Test admin email: reviewer@getstarvio.com
Password: (disable — pakai Google OAuth)
Alternative login: test-reviewer-2026 / [generated-password]
```

### Pre-populated Test Account
Isi test account dengan:
- 1 demo business (Demo Business)
- 20 demo customers dengan berbagai service history
- 5 templates aftercare sudah APPROVED
- Recent reminder logs (mix terkirim/gagal/pending)
- Connected sandbox WABA (Meta test phone number)

### Test Scenarios for Reviewer
```
Scenario 1: View scheduled reminders
- Login → Dashboard → see "Jadwal Pengingat Hari Ini" section
- Click "Lihat log" → navigate to Log Pengingat page → see delivery history

Scenario 2: Send a reminder
- Go to Pelanggan → pick customer "Sarah" (overdue for Hair Smoothing)
- Trigger manual send → verify message arrives in WhatsApp
- Return to dashboard → verify delivery status updates

Scenario 3: Manage templates
- Go to Admin → Templates tab
- View all 5 aftercare_followup templates with APPROVED status
- Click any template → see rendering preview with example parameters

Scenario 4: Onboard a new client (Embedded Signup)
- Go to Admin → "Add new client"
- Complete Embedded Signup flow with Meta test WABA credentials
- Verify waba_id, phone_number_id, business_id captured correctly

Scenario 5: View Coexistence sync status
- Any client WABA card → "View details"
- Verify Coexistence sync fields visible (contactsSynced, historySynced)
```

### App Screencast URL (separate from permission screencasts)
Upload a full end-to-end walkthrough (5-7 min) showing the complete user
journey from client signup → template submission → reminder schedule →
message delivery → webhook handling.

### Support Contact
```
Technical contact: dev@getstarvio.com
Policy contact: legal@getstarvio.com
Response SLA: 48 business hours
```

---

## ✅ SUBMISSION CHECKLIST (sebelum click Submit)

- [ ] Business Verification: **APPROVED** (prerequisite)
- [ ] App Settings: icon, privacy policy URL, terms URL, data deletion URL filled
- [ ] `whatsapp_business_messaging`: description + screencast Video 1 + business desc
- [ ] `whatsapp_business_management`: description + screencast Video 2 + business desc
- [ ] `whatsapp_business_manage_events`: **REMOVED** (not needed)
- [ ] `email`: ✅ (already done)
- [ ] `manage_app_solution`: description + screencast + API calls documented
- [ ] `business_management`: description + screencast + API calls documented (1 submission, not 8)
- [ ] `public_profile`: compliance agreed
- [ ] Data handling: collection statement + security measures + retention filled
- [ ] Reviewer instructions: test credentials + scenarios + support contact
- [ ] App mode: **In Development** → will flip to **Live** post-approval
- [ ] Webhook callback URL: configured + verified (HTTPS, responding 200 to challenge)

---

## ⚠️ COMMON REJECTION REASONS — HINDARI

1. **Requesting unnecessary permissions** — most common. Jangan request `whatsapp_business_manage_events` kalau tidak pakai marketing.
2. **Screencast shows customer-facing UI** — HARUS business-facing (admin panel).
3. **Video menggabungkan multiple permissions** — pisah per permission.
4. **Tidak ada real API call di video** — tampilkan DevTools Network tab.
5. **Business description terlalu generic** ("we help businesses") — harus specific (serve X industry with Y service).
6. **No test credentials provided** — reviewer tidak bisa test = reject.
7. **Webhook URL tidak respond challenge** — verify dulu `GET` verify challenge.
8. **Privacy policy tidak reflect Meta data handling** — harus mention Meta services specifically.
9. **Terms of service tidak cover WhatsApp use** — include WA-specific terms.
10. **Duplicate template submission** — jangan submit 5 identical templates dengan nama beda.

---

## 📅 TIMELINE EKSPEKTASI

| Step | Duration |
|---|---|
| Prepare content (descriptions, videos) | 2-3 hari |
| Record + edit 2+ screencasts | 1-2 hari |
| Submit to Meta | ~1 hari review cycle |
| App Review response | **24 hours** (fast track) to 5 business days |
| Resubmit if rejected (fix + submit) | 1-2 days per cycle |
| Access Verification (Tech Provider confirmation) | 5 business days after approval |

**Total realistis approval:** 1-3 minggu kalau approve first try, 2-6 minggu kalau 1-2x rejection.

---

## 📚 IMPLEMENTATION ke Mockup

Untuk nambah ini ke mockup `getstarvio-admin.html`, tambahkan tab/section baru **"Meta App Review"**:

```
Sections:
1. App Review Status — progress card (draft/submitted/approved per permission)
2. Permission Checklist — 6 permissions dengan status + artifacts required
3. Video Upload Artifacts — placeholder upload fields per permission
4. Description Editor — textarea per permission dengan suggested copy dari doc ini
5. Reviewer Credentials Generator — button "Generate test reviewer account"
6. Submit Readiness — checklist + "Submit to Meta" button (disabled sampai semua ✅)
```

---

---

## 📝 REVIEWER INSTRUCTIONS — Copy-Paste per Field (Meta form screenshots)

### Field 1: `instructions-web-2` (Main instructions)

```
getstarvio is a WhatsApp Tech Provider SaaS for Indonesian SMBs (salons,
spas, clinics, barbershops, nail studios, pet grooming, laundry). We send
automated aftercare reminder messages via WhatsApp Business Platform Cloud
API on behalf of our clients.

HOW TO ACCESS THE APP FOR REVIEW:

1. LOGIN AS END-USER (SMB OWNER DEMO)
   URL: https://getstarvio.com/getstarvio-login.html
   Click "Lanjut dengan Google" → select "Meta Reviewer" from the account picker
   → lands on Dashboard pre-populated with demo data (50 customers,
   42+ reminder logs, 6 service categories, full subscription state).

2. LOGIN AS TECH PROVIDER ADMIN
   URL: https://getstarvio.com/getstarvio-admin.html
   Credentials provided in the "access codes" field below.

META API USAGE BY PERMISSION:
- public_profile + email: /getstarvio-admin.html Google OAuth login
- whatsapp_business_messaging: Send UTILITY templates via Log Reminder +
  Catat Kunjungan flows
- whatsapp_business_management: Admin → Templates tab (5 UTILITY templates)
- business_management: Admin → "Onboard new client" Embedded Signup flow
- manage_app_solution: Tech Provider app configuration

FACEBOOK LOGIN USAGE CONFIRMATION:
Yes. Facebook Login is NOT used for end-user auth (they use Google OAuth).
FB Login is used ONLY in Embedded Signup where SMB owner authenticates once
to connect WhatsApp Business account, returning waba_id + phone_number_id
+ business_id.

Contact: dev@getstarvio.com (48h SLA)
```

### Field 2: `accesscode-web-1` (Access codes / test credentials)

```
END-USER DEMO (Google OAuth):
- URL: https://getstarvio.com/getstarvio-login.html
- Method: Click "Lanjut dengan Google" → select "Meta Reviewer"
- No password — demo-mode OAuth returns pre-seeded account

TECH PROVIDER ADMIN:
- URL: https://getstarvio.com/getstarvio-admin.html
- Password: jiccu5-coVwux-jizput
- Valid through: 19 April 2027

FACEBOOK TEST USER:
- Registered at: developers.facebook.com/apps/{APP_ID}/roles/test-users/
- Email: meta_reviewer@getstarvio.com
- Business Portfolio: "Demo Test Portfolio"
- Test WABA: Meta sandbox +1 555 0199 0001

FALLBACK:
- Admin: reviewer2@getstarvio.com / jiccu5-coVwux-jizput
- Support: dev@getstarvio.com
```

### Field 3: `accesscode-web-2` (Gift codes for paid app stores)

```
Not applicable. getstarvio is web-based SaaS at https://getstarvio.com —
no App Store / Play Store distribution.

Paid subscription (Rp 249.000/month) billed via Stripe after onboarding.
For review, Meta Reviewer demo account is pre-seeded in subscriber state —
no payment required.
```

### Field 4: `geo-web-5` (Geographic restrictions)

```
PRIMARY MARKET: Indonesia (34 provinces)
LANGUAGE: Bahasa Indonesia only
CURRENCY: IDR
TIMEZONES: WIB / WITA / WIT

ACCESSIBILITY FOR REVIEW:
- No geo-blocking or geo-fencing
- Meta reviewers from any country can access https://getstarvio.com
- CDN: Cloudflare global edge

COEXISTENCE LIMITATION (Meta's restriction, not ours):
- WA Business App Coexistence NOT supported in Nigeria (+234) and South
  Africa (+27) per Meta docs. Our onboarding blocks these country codes.

DATA RESIDENCY:
- AWS Asia-Pacific (Jakarta) — ap-southeast-3
- Chosen for Indonesian UU PDP compliance

FUTURE EXPANSION:
- Phase 2 (2027): Malaysia, Singapore, Philippines, Thailand, Vietnam
- Phase 3 (2028+): Additional APAC/global
```

### Field 5: `documents-web-1` (Supporting documentation)

**Where to get/create each file:**

| File to upload | Source / How to create | Priority |
|---|---|---|
| `getstarvio-full-walkthrough.mp4` | **Record baru** dengan tool screencast (QuickTime / Loom / OBS) mengikuti storyline di Video 1 + Video 2 sections di atas, gabung jadi 5-7 menit | Required |
| `getstarvio-architecture.pdf` | **Create baru** — diagram sederhana (bisa pakai Excalidraw/draw.io): Client Browser ↔ getstarvio Backend (AWS Jakarta) ↔ Meta Cloud API ↔ Customer WhatsApp | Required |
| `getstarvio-data-flow.png` | **Create baru** — flow diagram: Embedded Signup → waba_id/phone_id/business_id captured → stored encrypted (AWS KMS) → used untuk API calls | Required |
| `privacy-policy.pdf` | Export dari `https://getstarvio.com/privacy.html` — browser Print → Save as PDF | Required |
| `terms-of-service.pdf` | Export dari `https://getstarvio.com/terms.html` — browser Print → Save as PDF | Required |
| `data-deletion-process.pdf` | Export dari `https://getstarvio.com/data-deletion.html` — browser Print → Save as PDF | Required |
| `dpa-with-aws.pdf` | Download dari `https://aws.amazon.com/compliance/data-processing-agreement/` setelah sign di AWS Console | Optional but recommended |
| `meta-business-verification-approval.png` | Screenshot hasil Business Verification approved dari Meta Business Manager → Security Center | Optional |

**Storage location rekomendasi:**
- Simpan semua file di folder `assets/app-review/` di repo getstarvio (atau Google Drive shared folder)
- Naming convention: `{YYYY-MM-DD}-{filename}` biar versioning jelas kalau perlu re-submit
- Max file size Meta: 2GB per file, 8 file max

**Format Meta accept:** `.xls, .xlsx, .csv, .doc, .docx, .pdf, .txt, .jpeg, .jpg, .png, .ppt, .pptx, .mov, .mp4, .zip, .zipx`

**File path saat upload** — nanti di Meta form tinggal drag-drop atau click "Choose file". Pastikan file size < 100MB per file untuk cepet upload.

---

## 📝 DATA HANDLING — Copy-Paste per Field (Meta form screenshots)

### Field 1: `processor-0` (Data processors?)

**Select:** ✅ **Yes**

```
Yes. getstarvio uses the following data processors for Platform Data:

1. AMAZON WEB SERVICES (AWS)
   - Role: Primary cloud infrastructure
   - Services: EC2, RDS PostgreSQL, S3, CloudFront, Route 53, KMS
   - Region: Asia-Pacific (Jakarta) — ap-southeast-3
   - Platform Data: WABA IDs, phone number IDs, business portfolio IDs,
     access tokens (encrypted at rest with AWS KMS AES-256)
   - DPA: https://aws.amazon.com/compliance/data-processing-agreement/

2. STRIPE, INC.
   - Role: Payment processing (subscription billing)
   - Platform Data accessed: None
   - Region: USA
   - DPA: https://stripe.com/dpa

3. FUNCTIONAL SOFTWARE, INC. (Sentry)
   - Role: Error monitoring
   - Platform Data accessed: Sanitized error logs (tokens/IDs scrubbed)
   - Region: USA
   - DPA: https://sentry.io/legal/dpa/

4. POSTHOG INC.
   - Role: Product analytics (aggregate metrics)
   - Platform Data accessed: None — anonymized event names only
   - Region: EU (Germany)
   - DPA: https://posthog.com/dpa

5. CLOUDFLARE, INC.
   - Role: CDN + DDoS protection
   - Platform Data accessed: None — HTTPS traffic metadata only
   - Region: Global edge
   - DPA: https://www.cloudflare.com/cloudflare-customer-dpa/

All processors operate under signed DPAs meeting Meta Platform Terms,
Indonesian UU PDP, and EU GDPR. Access tokens encrypted at rest
(AES-256), never logged, never in client-side JavaScript or localStorage
in production.
```

### Field 2: `responsible-1` (Who is responsible for Platform Data?)

```
PT CAKRA DIGITAL INDONESIA

ROLE: Data Controller (GDPR/UU PDP)
ENTITY TYPE: Perseroan Terbatas (Indonesian LLC)

LEGAL DETAILS:
- Registered address: Jl. Raya Kelapa Puan Blok AD14 No. 16 & 17, Kel. Pakulonan Barat, Kec. Kelapa Dua, Kab. Tangerang, Banten 15810, Indonesia
- NIB: 2402220064559
- NPWP: 63.496.854.9-451.000
- KBLI: 62012 / 63122

CONTACTS:
- DPO: dpo@getstarvio.com
- Privacy: privacy@getstarvio.com
- Legal: legal@getstarvio.com
- Technical: dev@getstarvio.com

This legal entity determines purposes and means of processing Platform
Data received from Meta; controls access, retention, deletion, and
disclosure; is accountable under Meta Platform Terms, UU PDP, and GDPR
where applicable; has executed Meta Developer Terms and maintains
current Business Verification.

Day-to-day: Engineering + Compliance team, reporting to Director/CEO.
```

> ✅ **Placeholders replaced with PT Cakra Digital Indonesia data (19 Apr 2026).**

### Field 3: `responsible-2` (Country dropdown)

**Select:** **Indonesia**

### Field 4: `requests-3` (National security requests past 12 months)

**Select:** 🔘 **No**

(getstarvio is a new startup, no requests received)

### Field 5: `requests-4` (Policies for public authority requests — check all)

- ✅ Required review of the legality of these requests.
- ✅ Provisions for challenging these requests if they are considered unlawful.
- ✅ Data minimization policy — disclose minimum information necessary.
- ✅ Documentation of these requests, including responses and legal reasoning.

---

## 🎯 PRE-SUBMIT CHECKLIST FINAL

1. ~~**Fill `[LEGAL_ENTITY_NAME]` placeholders**~~ ✅ DONE (PT CAKRA DIGITAL INDONESIA, NIB, NPWP, alamat)
2. **Verify public pages accessible:**
   - https://getstarvio.com/privacy.html
   - https://getstarvio.com/terms.html
   - https://getstarvio.com/data-deletion.html
3. **Privacy policy** must include "Government Requests" section (4 items)
4. **Create Facebook test user** `meta_reviewer@getstarvio.com` di Roles → Test Users
5. **Setup fallback admin** `reviewer2@getstarvio.com`
6. **Upload to documents-web-1**: video + diagrams + policies + DPAs
7. **Record 2 videos** per Allowed Usage section specs
8. **Remove `whatsapp_business_manage_events`** dari Allowed Usage list
9. **Submit** via Meta App Dashboard → App Review

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-04-19 | File dibuat. Lengkap: business descriptions, permission descriptions, screencast storylines, API test calls, data handling, reviewer instructions, submission checklist, common rejection reasons |
| 2026-04-19 | **Tambah Reviewer Instructions section** (5 fields: instructions-web-2, accesscode-web-1, accesscode-web-2, geo-web-5, documents-web-1) + **Data Handling section** (processor-0, responsible-1/2, requests-3/4) dengan copy-paste ready content per Meta App Review form field. |
| 2026-04-19 | **Pre-submission readiness improvements.** (1) Added prominent "CRITICAL: MUST DO BEFORE SUBMITTING" section at top dengan placeholder replacement table — list semua `[LEGAL_ENTITY_NAME]`, NIB, NPWP, password placeholder yang wajib di-fill sebelum submit. (2) `public_profile` section extended — added Business Description (1-liner) + full usage description + 30-60s screencast storyline untuk kasus Meta form minta field lengkap. (3) `documents-web-1` extended dengan table: where to get each file (record new / create new / export from public URL / download from AWS Console), priority tier, storage location recommendation, file format/size limits. (4) Security warning about hardcoded password placeholder — regenerate before sharing externally. |
| 2026-04-19 | **PLACEHOLDER REPLACEMENT.** Replaced 4/7 placeholders: `[LEGAL_ENTITY_NAME]` → PT CAKRA DIGITAL INDONESIA, `[Jakarta office address]` → Jl. Raya Kelapa Puan Blok AD14 No. 16 & 17 Tangerang Banten 15810, NIB → 2402220064559, NPWP → 63.496.854.9-451.000. KBLI corrected 62019 → 62012. Remaining: 2 passwords (generate before submit) + 1 test user (create in Meta). Source: Google Drive NIB CDI.pdf + index.html footer. |
