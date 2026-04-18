# getstarvio — BACKLOG

> Roadmap features yang BELUM dieksekusi tapi yang bisa bikin getstarvio jadi tier-1 SaaS untuk UMKM Indonesia. Semua ide ini muncul dari diskusi & UIUX expert review.
>
> **Format:** tiap item punya — **Why** (konteks), **What** (scope), **Effort** (S/M/L/XL), **Impact** (low/med/high/critical).

---

## 🎯 PRIORITY 1 — High-Impact Roadmap Features

### 1. Multi-Location / Branch Support
**Why:** UMKM yang sukses biasanya expand ke 2-3 cabang (Salon Wangi Jakarta, Salon Wangi Surabaya). Sekarang owner harus buat akun terpisah per cabang = data fragmented + kredit ga bisa share.

**What:**
- 1 owner account → multiple locations/branches
- Per branch: pelanggan terpisah, QR check-in unique per cabang, automation settings per cabang
- Shared: kategori (template service), templates WA, billing/subscription, owner identity
- Branch switcher di sidebar (dropdown above nav)
- Reports: per-branch + consolidated
- Staff assignment per branch (lihat #2)

**Schema impact:**
- `U.locations: [{id, name, slug, address, qrUrl, ...}]`
- `U.activeLocationId` (current context)
- `customer.locationId` (which branch they belong to)
- `reminder.locationId`

**Effort:** XL (major refactor — schema + UI everywhere)
**Impact:** Critical for scaling customers beyond solo-UMKM

---

### 2. Staff Admin / Multi-User per Business
**Why:** Owner bukan cuma 1 orang. Salon punya kasir, manajer cabang, marketing. Sekarang semua orang pakai 1 akun = no audit trail, no permission boundaries.

**What:**
- 1 business → multiple users with **roles**:
  - **Owner** — full access (billing, settings, danger zone, semua)
  - **Manager** — semua kecuali billing & danger zone (per-branch kalau multi-loc)
  - **Kasir/Staff** — Catat Kunjungan only (no customer detail edit, no automation, no billing)
  - **Marketing** — Pelanggan + Log Pengingat read-only + Export
- Role-based UI: hide/disable features per role
- Invite flow: owner invite via email → invitee dapat link claim
- Audit log: siapa edit apa & kapan (di Admin panel)

**Schema impact:**
- `U.staff: [{id, name, email, role, locationId, invitedAt, lastActive}]`
- `staff.role: 'owner'|'manager'|'kasir'|'marketing'`
- All actions log: `auditLog: [{userId, action, target, timestamp}]`

**Effort:** XL (auth system + permission middleware + audit log + UI guards everywhere)
**Impact:** Critical untuk medium-business segment + compliance (audit trail)

---

### 3. Referral System
**Why:** UMKM owner network is tight (saling kenal dalam komunitas). Referral = lowest CAC channel. Belum di-tap.

**What:**
- Owner punya unique referral code (`?ref=CYNTHIA-X9K`)
- Referrer dapat: 100 kredit gratis kalau referee subscribe
- Referee dapat: extra 50 kredit di trial (total 150 instead of 100)
- Tracking: referral link generate dari Settings → "Referral" section
- Dashboard: "Referrals" widget showing pending/converted/total earnings
- Email notif saat referee convert
- Anti-abuse: 1 referral code per akun, max 50 redemption/bulan, owner ga bisa self-refer

**Schema impact:**
- `U.referralCode: string`
- `U.referredBy: referralCode | null`
- `U.referrals: [{refereeEmail, refereeId, status: 'pending'|'subscribed'|'churned', dateInvited, dateConverted, creditEarned}]`
- Banner di onboarding kalau came from referral

**Effort:** L (referral logic + tracking + UI section + email triggers)
**Impact:** High — compounds over time (each referrer brings ~3-5 leads)

---

## 🎨 PRIORITY 2 — Conversion / Marketing Polish

### 4. Real Testimonials Replacement
**Status:** Sekarang fabricated (Sarah Rahmadani, Andi Pratama, Maya Kartika di [index.html](index.html)). Risk: visitor savvy bisa Google + kena issue iklan Indonesia.
**What:** Recruit 5-10 beta tester real → kasih 6-bulan free → tukar testimonial + foto + nama bisnis.
**Effort:** M (program design + outreach + content collection)
**Impact:** Critical untuk landing trust

### 5. 30-second Demo Video
**Why:** Static hero mockup good, video better. Visitor lifecycle: read → want to see → sign up. Skip "see" = drop-off.
**What:** Screen recording 30 detik covering: scan QR → check-in → owner dashboard → kirim pengingat → pelanggan dapat WA → balas booking. Embed di hero atau Cara Kerja section.
**Effort:** M (record + edit + host on YouTube unlisted or Vimeo)
**Impact:** High — boosts cold traffic conversion 1.5-2x

### 6. FAQ Section di Landing
**What:** 5-7 pertanyaan kill objections:
- WhatsApp berbayar? (Tidak — pakai akun WA Business kamu sendiri, getstarvio cuma trigger)
- Bagaimana setup? (5 menit, ada onboarding step-by-step)
- Bisa cancel kapan saja? (Ya, tanpa fee)
- Data pelanggan aman? (Disimpan di server kami, tidak dijual ke pihak lain)
- Bedanya sama CRM lain? (Khusus reminder + WhatsApp + Indonesian SMB pricing)
- Multi-cabang support? (Roadmap)
- Refund gimana? (30 hari, claim via WA support)
**Effort:** S (HTML accordion + copy)
**Impact:** Medium — kill objections that kill conversion

### 7. Real Product Screenshots in Features Section
**What:** 6 feature cards sekarang cuma emoji + text. Replace with mini screenshots (mockup atau actual page snapshot crop).
**Effort:** M (capture + crop + design)
**Impact:** Medium — features feel concrete, scannable

### 8. Comparison Table vs Alternatives
**What:** Tabel vs "Manual chat WA", "CRM generic (HubSpot)", "Excel + manual reminder". Show getstarvio wins on: setup time, cost, automation, Indonesian-friendly.
**Effort:** S (HTML table + copy)
**Impact:** Medium — visitor yang lagi compare langsung clear value

### 9. Refund Policy Details Page
**What:** Buat `/refund-policy.html` — gimana claim refund 30 hari, syarat, timeline (7 hari kerja). Link dari pricing + footer.
**Effort:** S
**Impact:** Compliance + trust

---

## 🛠 PRIORITY 3 — UX Refinement (dari Expert Review)

### 10. Mobile testing pada device real
**Why:** Sekarang pakai responsive simulation. Belum diuji di iPhone SE 4.7", Samsung A-series, etc. Bisa ada layout regression yg ga keliatan di emulator.
**Effort:** M (test plan + bug log)

### 11. WCAG AA Accessibility Audit
**What:** Color contrast, focus states, keyboard nav, screen reader testing. Important untuk owner & pelanggan dengan disabilities + SEO.
**Effort:** M
**Impact:** Compliance + reach

### 12. Tap target audit semua page
**Why:** Reviewer flag beberapa button padding 9px (borderline WCAG AA). Min 44x44px target di mobile.
**Effort:** M

### 13. Form Input Number Formatting
**Status:** Sekarang Settings avgServiceValue sudah formatted. Belum: Admin Plan Config (6 inputs).
**What:** Apply parseIDR/fmtIDR pattern ke admin plan config inputs.
**Effort:** S
**Impact:** Internal consistency

### 14. Notification Settings Migration
**Status:** Sebelumnya direncanakan move dari Billing ke Settings → WhatsApp. Belum dieksekusi.
**What:** Hapus notif checkboxes dari Billing, default semua ON, optional toggle di Settings.
**Effort:** S
**Impact:** Decision fatigue removal

---

## 🔌 PRIORITY 4 — Backend / Integration (Beyond Prototype)

### 15. WhatsApp Business API Real Integration
**Sekarang:** Mocked dengan setTimeout + visual feedback.
**What:** Real Meta Cloud API integration via Embedded Signup. Owner connect Facebook → token captured → message send via API.
**Effort:** XL (proper backend, webhook handling, token refresh, template approval workflow)

### 16. Real Backend / Database
**Sekarang:** localStorage only — data hilang kalau ganti device atau clear browser.
**What:** Firebase / Supabase / PostgreSQL — proper auth, sync across devices, backup.
**Effort:** XL

### 17. Real Payment Gateway
**Sekarang:** Mocked subscribe/topup dengan setTimeout.
**What:** Xendit / Midtrans / Doku integration — real Rupiah payment via QRIS, transfer bank, e-wallet.
**Effort:** L

### 18. Email Notif (Selain WA)
**What:** Backup channel kalau WA gagal — kirim invoice, receipt, billing reminder via email.
**Effort:** M

### 19. CSV Bulk Import via API
**Sekarang:** Client-side parse CSV. Untuk file > 1MB atau 1000+ rows = slow.
**What:** Server-side processing dengan progress bar.
**Effort:** L

---

## ✨ PRIORITY 5 — Differentiators (Long-term Vision)

### 20. AI-Powered Send Time Optimization
**What:** ML model belajar pattern: pelanggan A baca pesan jam 7 malam, kirim ke dia jam 7. Pelanggan B respon lebih cepat pas siang.
**Effort:** XL
**Impact:** Open rate ↑ 30-50%

### 21. Customer Portal
**What:** Pelanggan punya self-service: lihat history visit, schedule next, request reschedule, opt-in/out reminder.
**Effort:** L

### 22. Photo Upload per Visit
**What:** Treatment before/after photos. Helpful untuk: salon (color before/after), klinik (skin progress), bengkel (spare parts before/after).
**Effort:** L

### 23. Loyalty / Points Program
**What:** Pelanggan dapat points per visit → redeem untuk diskon. Setting per business.
**Effort:** XL

### 24. Birthday Reminders
**What:** Auto-kirim ucapan + diskon di hari ulang tahun pelanggan.
**Effort:** S (kalau ulangtahun field sudah ada)

### 25. Custom Domain QR
**What:** Vanity URL — `wangi-spa.id/check-in` instead of `getstarvio.com/checkin/wangi-spa`. White-label feel.
**Effort:** L

### 26. Cross-Business Directory
**What:** Pelanggan satu salon bisa discover salon lain di area mereka via getstarvio. New customer acquisition channel for owners.
**Effort:** XL (network effect, perlu critical mass dulu)

### 27. A/B Testing Template Messages
**What:** Test 2 versi pesan reminder secara split — lihat mana convert lebih banyak booking.
**Effort:** L (need analytics infra)

### 28. Cohort Retention Analytics
**What:** Dashboard advanced: pelanggan yang pertama datang Januari — berapa % yang masih aktif di bulan 6? Cohort heatmap.
**Effort:** L

### 29. Invoice / Receipt Generation
**What:** Owner bisa generate kuitansi/invoice dari pelanggan visit, kirim via WA.
**Effort:** M

### 30. Webhook / Zapier Integration
**What:** Trigger external systems saat: customer registered, reminder sent, etc. Power user feature.
**Effort:** L

---

## 📋 BACKLOG HOUSEKEEPING

### Quick Wins (sisa dari sprint sebelumnya)
- [ ] Real testimonials (#4) — paling penting buat trust
- [ ] FAQ landing section (#6) — easy + high impact
- [ ] Notif settings migration (#14) — clean up
- [ ] Admin Plan Config number formatting (#13) — internal polish

### Tech Debt
- [ ] Add CHANGELOG.md untuk tracking version changes
- [ ] Lighthouse audit semua page (perf, a11y, SEO, best-practices)
- [ ] Bundle size budget (jangan lebih dari 200KB inline CSS)
- [ ] Compress emoji/SVG inline assets
- [ ] Remove dead code (unused functions setelah refactor)

### Documentation
- [ ] User guide PDF / video tutorial untuk owner
- [ ] Internal team playbook (admin operations)
- [ ] API documentation (kalau backend ready)
- [ ] Changelog page accessible to users

---

## 📊 SUMMARY

| Priority | Count | Total Effort | Description |
|---|---|---|---|
| P1 — High Impact Features | 3 | XL+XL+L | Multi-loc, Staff, Referral |
| P2 — Conversion Polish | 6 | M+M+S+M+S+S | Landing optimization |
| P3 — UX Refinement | 5 | M+M+M+S+S | Mobile, accessibility, polish |
| P4 — Backend Integration | 5 | XL+XL+L+M+L | Real backend, payment, WA API |
| P5 — Differentiators | 11 | mostly L/XL | Long-term vision |

**Estimasi total effort untuk launch-ready:** P2 + P3 + critical P4 (real backend + payment + WA API) = ~3-4 bulan dengan 2-3 dev.

**Estimasi untuk competitive moat:** + P1 + selected P5 = ~6-9 bulan additional.

---

## CHANGELOG

| Tanggal | Update |
|---|---|
| 2026-04-19 | File dibuat. Compiled dari diskusi sesi cleanup + UIUX review. |
