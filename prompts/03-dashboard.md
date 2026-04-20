# Page: DASHBOARD (`getstarvio-dashboard.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Halaman utama setelah login. **ROI selling machine** — owner harus segera merasa value getstarvio (dampak pengingat dalam revenue) + post-onboarding setup checklist supaya cepet ke "first value". Action-first tetap, tapi sekarang prominent: Setup Checklist + ROI Card jadi primary, metrics & quick links secondary.

---

## SECTION ORDER (urutan dari atas ke bawah)

1. **Trial Soft Lock Banner** (kalau `trialExpired`) — soft lock model: dashboard tetap visible, banner merah + Quick Links 2/3 disabled, Catat Kunjungan link tetap aktif
2. **Credit Alert** (kalau `remLeft < 10` ATAU `trialDaysLeft <= 3`)
3. **Setup Checklist Card** (kalau `setupComplete === false` — auto-dismiss permanent saat semua selesai)
4. **Live Activity Feed** (existing)
5. **Greeting Card** (background light, 3 tile: Kunjungan Hari Ini, Kredit Tersisa, Belum Balik)
6. **ROI Card** (kalau ada reminder data bulan ini) ATAU **Projection Card** (kalau belum ada data tapi ada customers)
7. **Metrics Grid** (4 kartu reframed)
8. **Pelanggan Perlu Perhatian**
9. **Jadwal Pengingat Hari Ini**
10. **Quick Links** (3 kartu — pindah dari atas ke bawah supaya ROI Card jadi star)
11. **Tips Section** (compact, Print QR + Salin Link)

---

## Must-Have

### Setup Checklist (top, conditional, auto-detect) — 7 STEPS

Tampil kalau `U.setupComplete === false` atau ada step yang "turun" setelahnya (misal automation di-matiin lagi). Auto-dismiss permanent (set `setupComplete: true`) saat **semua 7 step** selesai. Progress bar visual: X dari 7 selesai.

**Urutan: SECURITY-FIRST** — tanpa PIN, user tidak bisa edit aksi kritis (toggle automation, delete, ubah jam, dll semua PIN-gated), jadi security setup harus di awal. Urutan: `verify → pin → brand → data → physical → go-live`.

**Step 1: Verify WhatsApp Owner (OTP)** — IDENTITY PROOF
- Action: button "Verify WA →" link ke `getstarvio-settings.html#wa`
- User input nomor WA owner → klik "Kirim OTP" → terima kode 6-digit via WA → verify
- Complete condition: `U.ownerWaVerifiedAt !== null`
- Setelah complete: "WA owner verified ✓"
- **Rationale:** Wajib sebelum PIN — proof of phone ownership sebelum setup PIN (proof of intent)

**Step 2: Setup PIN Admin** — ACTION GATE
- Action: button "Atur PIN →" link ke `getstarvio-settings.html#pin`
- User input 4-digit PIN + konfirmasi → save
- Complete condition: `U.adminPin !== null` (or `adminPinHash` truthy di backend)
- Setelah complete: "PIN aktif ✓"
- **Locked state:** kalau `!U.ownerWaVerifiedAt`, tombol jadi `🔒 Locked` pill (disabled, tooltip "Verify WA Owner dulu")
- **Rationale:** PIN proteksi aksi kritis (delete kategori/pelanggan, toggle automation, ubah jam kirim, auto-topup). Tanpa PIN = gate lainnya tidak effective.

**Step 3: Upload logo bisnis** (brand identity)
- Action: **inline** file picker dari card ini (no redirect)
- Accept PNG/JPG, max 200KB, resize via canvas ke 120x120
- Save ke `getstarvio_user.bizLogo`
- Complete condition: `bizLogo !== null`
- Setelah complete: preview thumbnail 32px circle + "Logo siap ✓"

**Step 4: Pilih template pengingat** (brand voice)
- Tujuan: owner aktif memilih template per kategori (formal/casual/appreciation/etc.) biar match brand tone — bukan terima default
- Action: button "Pilih template →" link ke `getstarvio-kategori.html` (bukan Automation page lagi — di Automation sekarang cuma toggle, template editing ada di Kategori)
- **Edge case:** kalau `(U.cats || []).length === 0`, button "Tambah kategori →" link ke `getstarvio-kategori.html` (harus setup kategori dulu)
- Complete condition: `templatesReviewedAt !== null` (set otomatis saat owner klik Simpan di edit kategori pertama)
- Setelah complete: "Template sudah disesuaikan ✓"

**Step 5: Tambah pelanggan pertama** (populate data)
- Action: button "Tambah →" link ke `getstarvio-pelanggan.html?action=add`
- Complete condition: `(customers || []).length > 0`
- Auto-detect saat user kembali ke dashboard
- Setelah complete: "X pelanggan terdaftar ✓"

**Step 6: Pasang QR check-in** (physical setup)
- Action: button "Pasang QR →" link ke `getstarvio-settings.html#qr`
- Complete condition: `qrPosted === true` OR ada customer dengan `via === 'qr'`
- Setelah complete: "QR sudah dipasang ✓" atau "X pelanggan via QR ✓"

**Step 7: Aktifkan automation** (go-live)
- Action: button "Aktifkan →" link ke `getstarvio-automation.html`
- Complete condition: `automationEnabled === true`
- Setelah complete: "Automation aktif ✓"

**Auto-hide logic (explicit):**
```js
doneCount = 
  (ownerWaVerifiedAt ? 1 : 0) +
  (adminPin ? 1 : 0) +
  (bizLogo ? 1 : 0) +
  (templatesReviewedAt ? 1 : 0) +
  (customers.length > 0 ? 1 : 0) +
  (qrPosted || customers.some(c => c.via === 'qr') ? 1 : 0) +
  (automationEnabled ? 1 : 0)
setupComplete = (doneCount === 7)  // set permanent at 7/7
```

**All done state (7/7):**
- Card ganti jadi success message: "🎉 Setup selesai! getstarvio siap kirim pengingat otomatis ke pelangganmu."
- Auto-hide setelah 5 detik + tombol "Tutup" manual
- Set `setupComplete: true` permanent (card tidak muncul lagi — kecuali ada step yang turun: `doneCount < 7` → muncul lagi)

### Notification Bell (topbar, NEW — added 20 Apr 2026)

Moved dari inline "Yang baru terjadi" card (previously below setup checklist) → bell icon 🔔 di topbar kanan (sebelah WA chip). Cleaner dashboard, surfaced across all pages.

**UI:**
- Bell icon button 36px round, `.notif-btn` class (background `var(--bg3)`, border ring)
- Red badge di kanan atas dengan unread count (format: number, capped "99+")
- Click → dropdown panel (position: fixed, top:68px, right:24px, width:360px, max-height:420px scrollable)
- Panel header: "Yang baru terjadi" title + pulse dot "Sistem berjalan"
- Panel body: last 15 events (sama render logic dari `.feed-row` class — reused)

**Events rendered (sorted by date desc, top 15):**
1. Reminder terkirim — `📨 Pengingat terkirim ke <nama> untuk <layanan>` (lime bg)
2. Reminder gagal — `❌ Pengingat gagal ke <nama> untuk <layanan>` (red bg)
3. New customer via QR — `👤 Pelanggan baru: <nama> via QR check-in`
4. Visit recorded — `📋 Kunjungan dicatat: <nama> — <icon> <layanan>`

Each row = `<a href="link">` to relevant page (Log Pengingat / Pelanggan).

**Badge logic:**
```js
const lastSeenMs = u.notifLastSeenAt ? new Date(u.notifLastSeenAt).getTime() : (Date.now() - 7*86400000)
const unreadCount = events.filter(ev => new Date(ev.date).getTime() > lastSeenMs).length
// Default (no notifLastSeenAt yet): treat past 7 days as unread
```

**Interactions:**
- Click bell → panel opens + auto-mark-as-read (save `notifLastSeenAt = new Date().toISOString()`) → badge disappears
- Click outside panel or press Escape → panel closes
- Click a row → navigate + panel closes

**State field:** `notifLastSeenAt: "ISO string | null"` (see `00-global.md` schema)

**Mobile responsive:** Panel becomes full-width dengan 16px margins (`@media (max-width: 480px)`)

**Z-index:** 250 (above sidebar 200, below trial lock 1000 and util-dialog 700). Panel uses `position: fixed` so tidak clipped by `.main { overflow: hidden }`.

### Greeting Card (background `var(--bg2)` / light)
- Teks: "Selamat pagi/siang/sore, [adminName]!" — berdasarkan jam (pagi <11, siang 11–14, sore ≥14)
- Tanggal hari ini
- 3 tile angka di kanan:
  - Kunjungan Hari Ini — hitung customer yang ada `service.date = hari ini`
  - Kredit Tersisa — `remLeft`, warna lime
  - **Belum Balik** (was "Pelanggan Hilang" — softer label, same data) — `worstStatus() === 'hilang'`

### ROI Card (kalau ada reminder data bulan ini)

Tampil kalau `reminders.filter(terkirim && thisMonth).length > 0`. Format:

**3 big numbers (horizontal row):**
- **Pelanggan kembali** (lime, big) — customer yang visit dalam **7 hari** setelah `reminder.sentAt` mereka, bulan ini
- **Pengingat terkirim** (neutral) — `reminders.filter(terkirim && thisMonth).length`
- **Response rate** (neutral, %) — kembali / terkirim × 100

**ROI Box (background subtle lime):**
- "Estimasi pendapatan kembali: ~Rp [returnedCount × avgServiceValue]" — lime bold
- "Biaya pengingat: ~Rp [sent × 830] ([sent] × Rp 830)" — muted, smaller
- "ROI: [estRevenue/totalCost]x lipat" — lime badge

**Closing copy (italic, muted, center):**
- Default: "Tanpa pengingat, [returned] pelanggan ini mungkin lupa balik ke bisnis kamu."
- Edge case (returned=0 tapi sent>0): "Pengingat sedang bekerja — pelanggan yang diingatkan biasanya kembali dalam beberapa hari."

**Calculations:**
- `costPerCredit = 830` (Rp 249.000 / 300 kredit)
- `avgServiceValue` dari `getstarvio_user.avgServiceValue` (default Rp 150.000, editable di Settings)

### Projection Card (alt — untuk user baru tanpa reminder data)

Tampil kalau `reminders[]` kosong/no terkirim bulan ini, tapi `customers.length > 0`. Format:

- Title: "💡 Potensi Pengingat Kamu"
- Intro: "Dengan **[X] pelanggan aktif**, estimasi dampak pengingat otomatis setiap bulan:"
- 2 big numbers (lime box):
  - "~[estReminders]" pengingat / bulan (asumsi 30% customer perlu reminder)
  - "~Rp [estRevenue]" potensi pendapatan kembali (estReminders × 25% × avgServiceValue)
- Footnote: "Rata-rata **25%** pelanggan yang diingatkan akan kembali. Setiap pengingat = **Rp 830**. Setiap kunjungan = **~Rp 150k**."

Kalau `customers === 0`: skip projection (Setup Checklist Step 2 handle ini).

### Metrics Grid (4 kartu — REFRAMED)
- Total Pelanggan — variant `neutral` — `customers.length`
- **Kembali via Pengingat** — variant `lime` — same logic as ROI Card (returnedCount). Kalau no reminder data: tampilkan "—" + "Aktifkan automation untuk mulai"
- Pengingat Terkirim — variant `blue` — `reminders.filter(terkirim && thisMonth).length`
- **Belum Balik** — variant `red` jika >0 — `customers.filter(worstStatus === 'hilang').length`

> Metric "Kembali via Pengingat" = metric paling penting. Directly menunjukkan value getstarvio.

### Section: Pelanggan Perlu Perhatian
- Tampilkan customer dengan status `hilang` atau `mendekati` (berdasarkan `worstStatus()`)
- Per baris: avatar, nama, status badge, nama layanan terburuk + berapa hari overdue
- Link "Lihat semua →" ke `getstarvio-pelanggan.html`
- Empty state jika semua pelanggan aktif

### Section: Jadwal Pengingat Hari Ini
- List reminder dari `reminders[]` yang `scheduledAt` = hari ini
- Per baris: nama pelanggan, layanan, status chip (terkirim/pending/gagal)
- Link "Lihat log →" ke `getstarvio-log-reminder.html`
- Empty state jika tidak ada pengingat hari ini

### Quick Links (3 kartu — DIPINDAH KE BAWAH, after Jadwal Pengingat)
- Catat Kunjungan → `getstarvio-catat-kunjungan.html` — **selalu aktif** (data preservation)
- Tambah Pelanggan → `getstarvio-pelanggan.html?action=add`
- Atur Automation → `getstarvio-automation.html`
- **Soft lock state:** Quick Links 2 & 3 disabled (opacity .45, pointer-events: none) saat trialExpired. Catat Kunjungan tetap aktif.

### Tips Section (bawah halaman, compact, always visible)

Background `var(--bg2)`, compact card. 2 tips:
- "📋 Tempel QR di kasir — pelanggan scan, otomatis masuk sistem. **Print QR →**" (link ke Settings)
- "📱 Bagikan link check-in ke pelanggan lama via WhatsApp. **Salin Link →**" (clipboard copy + alert)

### Topbar
- WA status chip: Aktif (lime pulse) / Terputus (red)
- Baca dari `localStorage waNum` — jika ada = aktif, jika kosong = terputus

### Credit Alert
- Jika `remLeft < 10`: tampilkan warning banner
- Jika `plan === "trial"` && `trialDaysLeft <= 3`: tampilkan "Free trial: [X] hari tersisa..."
- Banner di bawah Trial Soft Lock (jika ada)

---

## Trial Behavior — HYBRID MODEL (Important)

**Dashboard SOFT LOCK** (different from sidebar pages yang HARD LOCK):

Saat `trialExpired === true`:
- Dashboard **tetap visible read-only** (TIDAK ada full-screen overlay)
- Trial Soft Lock banner merah di atas dengan CTA "Subscribe →"
- Quick Links 2 & 3 disabled (opacity, pointer-events:none) — Catat Kunjungan tetap aktif
- ROI Card / Projection Card / Metrics tetap render (visible "preview value" untuk push subscribe)
- Owner bisa lihat semua data + metric, tapi tidak bisa action di Quick Links 2/3

**Filosofi:** Dashboard punya nilai sebagai "preview" yang bikin owner pengen subscribe (lihat ROI, metrics, customer list). Sidebar pages lain (Pelanggan, Kategori, Settings, Log, Automation) tetap hard lock — action pages butuh subscribe untuk akses.

**Implementasi:**
- `applySoftLock(U)` di dashboard — hide overlay, show banner, disable Quick Links 2/3
- `checkTrialLock()` + `showTrialLockOverlay()` di-stub jadi no-op di dashboard (overlay element dihapus)
- Pages lain (sidebar except billing+catat-kunjungan) tetap pakai hard lock overlay

---

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-dashboard.html` — v2.1 memotong ~42% konten dashboard (sections hilang, metric cards berkurang)
- **Jangan pakai v2.1 dashboard** sebagai acuan — terlalu stripped down
- Section yang harus ada tapi sering dihilangkan AI: "Pelanggan Perlu Perhatian", "Jadwal Reminder Hari Ini", Quick Links 3 kartu
- Credit Alert banner (remLeft < 10) harus muncul — sering terlewat di iteration sebelumnya

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Update: action-first layout, tambah credit alert dari doc lama |
| 2026-03-26 | Tambah Reference section — acuan v2.0, warning jangan pakai v2.1 |
| 2026-04-18 | **MAJOR UIUX OVERHAUL.** Setup Checklist 3 step (logo inline upload / pelanggan / automation, persistent sampai semua selesai, auto-detect + auto-dismiss permanent setelah selesai). ROI Card baru (untuk user dengan reminder data — pelanggan kembali, response rate, estimasi revenue, ROI multiplier, ROI framing copy). Projection Card untuk user baru tanpa reminder data. Metrics Grid reframe: "Kembali via Pengingat" jadi metric utama (was Kunjungan Bulan Ini), "Pelanggan Hilang" → "Belum Balik" (softer label). Quick Links pindah dari atas ke bawah (after Jadwal Pengingat) — ROI Card jadi star. Tips Section bawah (Print QR + Salin Link). **Trial Behavior HYBRID MODEL:** Dashboard SOFT lock (banner + Quick Links 2/3 disabled, Catat Kunjungan tetap aktif), sidebar pages lain tetap HARD lock overlay. Greeting tile #3 label change. |
| 2026-04-19 | **SETUP CHECKLIST 4 → 5 STEPS + REORDER.** Tambah step baru "Pilih template pengingat" (Step 2) untuk paksa owner aktif customize template per kategori — bukan terima default `aftercare_followup_1`. Reorder total jadi story flow: brand identity (logo) → brand voice (templates) → data (customers) → physical (QR) → go-live (automation). Complete detection via new `templatesReviewedAt` field (ISO string, set otomatis di Automation page `saveFlowChanges()` idempotent). Edge case: kalau `cats.length === 0`, step 2 CTA redirect ke Kategori dulu. Progress bar sekarang X/5. |
