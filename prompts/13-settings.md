# Page: SETTINGS (`getstarvio-settings.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Konfigurasi akun dan bisnis + QR Check-in management. Dibangun di v3 — tidak ada di versi sebelumnya. QR check-in content yang dulu ada di halaman Kumpulkan sekarang ada di sini.

---

## Must-Have

> **Layout:** Semua sections adalah collapsible accordions. Satu terbuka pada satu waktu (klik section lain → yang sebelumnya tertutup). Urutan: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone. QR Check-in default terbuka saat load.

### Section 1: QR Check-in (paling atas, default open)
Konten QR check-in yang dulu ada di halaman Kumpulkan sekarang ada di sini:
- **QR Code display** — tampilkan QR code untuk URL `getstarvio.com/checkin/[bizSlug]`
- **Tombol:** Print QR, Unduh QR
- **Link check-in** — tampilkan URL lengkap + tombol Salin + Share WA
- **Cara pakai — 4 langkah** (numbered steps):
  1. Print/tempel QR di kasir
  2. Pelanggan scan saat datang
  3. Isi nama & WhatsApp
  4. Otomatis masuk ke daftar pelanggan
- **Teks siap pakai** — 3 copy blocks yang bisa disalin (WhatsApp caption, Instagram caption, dll)
- **Stats:** Scan Hari Ini, Total via QR (dihitung dari `customers[].via === 'qr'`)
- **Tips box** — tips supaya lebih banyak yang scan

### Section 2: Profil Bisnis
- **Logo Bisnis (opsional, di atas Nama Bisnis):**
  - Upload area 120x120 dashed border + placeholder "📷 Upload logo"
  - Setelah upload: preview logo + tombol "📤 Upload" (ganti) + "🗑️ Hapus" (dengan confirm dialog)
  - Accept: `.png, .jpg, .jpeg`
  - Validasi:
    - Format: PNG/JPG only (error inline kalau bukan)
    - Max size 200KB (error inline kalau lebih, tampilkan ukuran file)
    - Aspect ratio: square-ish (max 1.5:1) — kalau lebih, warning amber "bagian gambar mungkin terpotong"
  - **Resize via canvas** ke max 120x120 sebelum disimpan (preserve aspect, output PNG kalau input PNG, JPEG 0.85 quality kalau input JPG)
  - Save base64 data URL ke `getstarvio_user.bizLogo`
  - Hapus → set `bizLogo = null` (fallback ke initial circle di check-in)
- Edit: Nama Bisnis, Jenis Bisnis (visual grid, sama seperti onboarding), Timezone
- Nama Admin (read-only)
- Email (read-only, dari Google OAuth)
- Tombol "Simpan Profil" — update localStorage (kecuali logo yang auto-save saat upload)

### Section 3: WhatsApp & Notifikasi

**WA Connection Status:**
- Nomor WA aktif: tampilkan `waNum` + status dot (hijau/merah) + label terhubung/terputus
- Tombol "Hubungkan ulang" → buka QR reconnect modal
- QR reconnect modal: scan QR + "Simulasi Terhubung" button

**Nomor WA Pemilik (`ownerWa`) + OTP Verification:**
- Editable input dengan country code selector (apply global phone rules: strip leading 0, simpan format `628xxx`)
- Hint: "Nomor ini dipakai untuk menerima notifikasi billing via WhatsApp"
- **OTP verification flow** (tercantum persis di bawah field, tidak di modal terpisah):
  - **State 1 — Belum diverifikasi (amber):** warning card amber "Nomor belum diverifikasi" + sub "Verifikasi via OTP agar notifikasi billing bisa terkirim" + tombol "Kirim OTP"
  - **State 2 — OTP terkirim (white + lime border):** card dengan "Masukkan kode 6-digit" + hint "(demo: 123456)" untuk prototype + OTP input (JetBrains Mono, letter-spacing wide, centered) + tombol "Verifikasi" + tombol "Kirim ulang" + inline error message area
  - **State 3 — Terverifikasi (lime):** card lime dengan check icon + "Nomor terverifikasi" + tanggal verifikasi + tombol "Verifikasi ulang" (untuk ganti nomor)
- **Logika OTP:**
  - `sendOwnerWaOtp()`: generate 6-digit code, simpan ke `u.ownerWaOtpPending = { code, expiresAt }` (expiry 5 menit), tampilkan kode inline di "hint" untuk prototype testing
  - `verifyOwnerWaOtp()`: cek input match + belum expired → set `u.ownerWaVerifiedAt = ISO string`, clear pending
  - `resetOwnerWaVerify()`: confirm dialog → clear `ownerWaVerifiedAt` + `ownerWaOtpPending` → back ke state 1
  - **Auto re-verify trigger:** kalau user ubah nomor WA pemilik → hapus `ownerWaVerifiedAt`, paksa verifikasi ulang
  - Kalau OTP expired: error "Kode OTP sudah kadaluarsa. Klik Kirim ulang."
  - Kalau OTP salah: error "Kode OTP salah. Cek lagi."

**Pengaturan Notifikasi (migrated dari billing page Section 8):**
- **Divider** dashed di atas notif section (memisahkan dari field WA)
- Heading: "Pengaturan Notifikasi" + sub "Pilih notifikasi yang ingin diterima di WhatsApp owner."
- 4 checkbox cards (bordered, active state = lime-bg + lime-border):
  1. **Kredit total rendah** — "Saat kredit total turun di bawah 30" — key `lowCredit` (default ON)
  2. **Kredit total kritis** — "Saat kredit total turun di bawah 10" — key `criticalCredit` (default ON)
  3. **Kredit subscription hampir habis** — "Saat kredit bulanan subscription < 50" — key `subLow` (default ON)
  4. **Pengingat perpanjangan langganan** — "3 hari sebelum subscription otomatis diperpanjang" — key `renewalReminder` (default ON)
- Simpan ke `u.billingNotifs = { lowCredit, criticalCredit, subLow, renewalReminder }`

**Tombol Simpan (combined):** "Simpan Pengaturan WA & Notifikasi" — save both:
- `u.ownerWa` (dengan cc prefix + number)
- Detect if new ownerWa ≠ saved → reset `ownerWaVerifiedAt = null` + `ownerWaOtpPending = null` (paksa re-verify)
- `u.billingNotifs` dari 4 checkbox states
- Toast "Pengaturan WA & notifikasi disimpan!" + refresh OTP verify UI

**Why semua di satu section:** notifikasi billing (low credit, kritis, renewal) dikirim ke `ownerWa`. Taruh nomor + verifikasi + pilihan notif di 1 tempat supaya owner langsung lihat connection: "nomor ini → notifikasi ini".

### Section 4: PIN Admin (🔐, setelah WhatsApp)

**Rationale:** Login via Google OAuth (tanpa password), jadi PIN 4-digit jadi secondary auth factor untuk aksi kritis. PIN-gated actions: delete kategori/pelanggan, toggle master automation, toggle per-kategori automation, ubah jam kirim automation, toggle Auto Top-Up billing.

**4 state rendering via `renderPinAccordion(u)`:**

- **State A: PIN exists + OTP verified** → show change/remove UI
  - Card lime "PIN Terpasang" + tanggal di-set + masked `••••`
  - Form: PIN sekarang + PIN baru + konfirmasi PIN baru → tombol "Ubah PIN" + "Hapus PIN"
  - Sub label accordion: "Terpasang · ••••"

- **State B: PIN exists + OTP NOT verified** → show gate card, block change/remove
  - Amber gate card: "Verify WhatsApp owner untuk ubah PIN — PIN kamu masih aktif & proteksi jalan — tapi untuk ganti / hapus PIN, kamu harus re-verify WA owner dulu (proof of identity)."
  - CTA button "Re-verify WhatsApp →" → anchor ke `#wa` accordion
  - Sub label accordion: "Terpasang · Verify WA untuk edit"
  - PIN tetap active untuk gate aksi lain (tidak di-invalidate saat OTP reset)

- **State C: PIN not set + OTP NOT verified** → show gate card, block setup
  - Amber gate card: "Verify WhatsApp owner dulu — Nomor WA owner harus diverify via OTP sebelum setup PIN — biar identitas pemilik akun jelas (OTP = proof of phone ownership, PIN = proof of intent)."
  - CTA button "Verify WhatsApp →"
  - Sub label accordion: "Verify WA dulu"

- **State D: PIN not set + OTP verified** → show setup form
  - Form: 2x field 4-digit numeric (PIN + Confirm) + validasi match + weak-PIN warning
  - Weak PIN list: `['0000','1111','2222','3333','4444','5555','6666','7777','8888','9999','1234','4321','0123','1212']` → show `showConfirm` modal "PIN mudah ditebak, tetap lanjut?" sebelum save
  - Tombol "Simpan PIN" → save ke `u.adminPin` + `u.adminPinSetAt = new Date().toISOString()`
  - Sub label accordion: "Belum diatur"

**Logika PIN:**
- `savePinSetup()`: validate PIN 4-digit numeric + confirmation match + OTP verified guard → save
- `savePinChange()`: validate current PIN + new PIN different + OTP verified guard → save
- `removePin()`: prompt current PIN (via `showPrompt`) → confirm via `showConfirm` → delete `u.adminPin` + `u.adminPinSetAt`
- **Defense-in-depth:** Internal `proceedSetup()` / `proceedChange()` re-check `u.ownerWaVerifiedAt` sebelum save (belt-and-suspenders, catches state changes between outer guard and deferred save via weak-PIN warning flow)
- **OTP reset behavior:** `resetOwnerWaVerify()` memanggil `renderPinAccordion()` → auto-lock PIN accordion (transition ke state B kalau ada PIN, state C kalau belum)
- **OTP verify success behavior:** `verifyOwnerWaOtp()` memanggil `renderPinAccordion()` → auto-unlock (transition ke state A kalau ada PIN, state D kalau belum)

**Shared `requirePin(actionFn, contextLabel)` helper** (dipakai di automation/billing/kategori/pelanggan untuk gate aksi kritis):
- Kalau `!u.adminPin` → `showWarning()` close-only modal dengan CTA ke `settings.html#pin` (TIDAK ada backdoor "Lanjut tanpa PIN")
- Kalau `u.adminPin` set → buka `m-pin-gate` shared modal → user input 4-digit → validate match → jalankan `actionFn()`
- On wrong PIN: shake animation + error "PIN salah — coba lagi"

**Kategori/Pelanggan delete pakai inline PIN pattern** (bukan `requirePin()`) — PIN input di dalam delete confirm modal (1-step UX better than 2-modal chain). Shake animation on wrong PIN.

### Section 5: Kategori Defaults
- Field "Default Interval — Fallback" (number input 1-365) — dipakai kalau pelanggan tidak punya kategori layanan spesifik
- Hint: "Setting default untuk kategori baru. Tiap kategori bisa override ini di page Kategori."
- Tombol "Simpan" → clamp 1-365, save ke `u.defaultInterval`
- Sub label accordion: "Interval fallback X hari"
- **Moved from Kategori page** (was previously duplicated there, consolidated di Settings untuk remove duplikasi)

### Section 6: Danger Zone (collapsible, paling bawah)
- "Reset semua data" → konfirmasi modal → `localStorage.removeItem('getstarvio_user')` → redirect ke login
- "Export data" → download `getstarvio_user` sebagai JSON file

---

## Yang TIDAK Ada di Halaman Ini

- WA reconnect untuk automation — itu ada di halaman **Automation** (master card)
- Catat kunjungan — itu ada di **Catat Kunjungan** (`getstarvio-catat-kunjungan.html`)

> Note: Settings punya QR reconnect modal untuk owner WA, tapi Automation punya QR reconnect terpisah untuk nomor yang dipakai kirim reminder.

---

## Reference

- QR Check-in section dipindahkan dari halaman Kumpulkan ke Settings
- Design mengikuti design system global (`00-global.md`) + sidebar standard
- Jenis Bisnis di edit profil: gunakan visual grid yang sama persis seperti di onboarding Step 2
- Danger Zone: wajib pakai collapsible/accordion — jangan langsung terbuka
- Reset data → redirect ke `getstarvio-login.html` (bukan onboarding)
- Section order: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Halaman baru — belum dibangun di versi sebelumnya |
| 2026-03-26 | Tambah Reference section — halaman baru, pattern dari onboarding visual grid |
| 2026-03-26 | **Major update:** Added QR Check-in section (top of page) — moved from old Kumpulkan page. Includes QR display, Print/Unduh, link+Salin+Share WA, Cara pakai 4 langkah, Teks siap pakai (3 blocks), Stats (Scan Hari Ini, Total via QR), Tips box. WA reconnect kept in Settings for owner WA. Section order: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone. |
| 2026-04-18 | **Tambah Logo Upload** di Section 2 (Profil Bisnis, di atas Nama Bisnis). Upload area 120x120 dashed → preview + tombol Ganti/Hapus (dengan confirm). Accept PNG/JPG, max 200KB, aspect ratio square-ish (warning kalau lebih dari 1.5:1). Resize via canvas ke max 120x120 sebelum simpan base64 ke `bizLogo`. Logo dipakai di check-in page header + QR print layout (fallback ke initial circle kalau null). Auto-save (tidak perlu klik "Simpan Profil"). **QR print layout updated:** logo/initial circle 80px + bizName 22px bold + QR + "Scan untuk check-in" + "Powered by getstarvio" footer. |
| 2026-04-18 | **Tambah avgServiceValue field** di Section 2 (Profil Bisnis, di bawah Nama Admin). Number input dengan prefix "Rp" + JetBrains Mono. Default Rp 150.000. Dipakai untuk ROI calculation di dashboard (estimasi pendapatan = pelanggan kembali × harga rata-rata). Hint text menjelaskan kegunaannya. Tersimpan saat klik "Simpan Profil". |
| 2026-03-26 | Sync with HTML: All sections are collapsible accordions (QR, Profil, WA, Danger Zone). One open at a time. QR default open on load. |
| 2026-04-18 | **WA + NOTIFIKASI MERGED.** Section 3 renamed "WhatsApp" → "WhatsApp & Notifikasi". Added OTP verification flow untuk `ownerWa` (3-state: unverified amber / pending / verified lime + auto re-verify on number change). Migrated 4 notification checkboxes dari billing page Section 8 (lowCredit/criticalCredit/subLow/renewalReminder) — simpan ke `u.billingNotifs`. Combined save button "Simpan Pengaturan WA & Notifikasi". Schema additions: `ownerWaVerifiedAt` (ISO string \| null), `ownerWaOtpPending` ({ code, expiresAt } \| null). Billing Section 8 dihapus. |
| 2026-04-19 | **META CONNECTION PERSISTENT DISPLAY.** Section 3 WhatsApp: tambah Meta connection card di bawah WA status yang menampilkan persistent info hasil Embedded Signup — verified name, business portfolio name, quality rating badge (HIGH/MEDIUM/LOW/UNKNOWN), messaging tier (1K/10K/100K/Unlimited pesan/hari). Tombol "Lihat teknis →" buka modal dengan Info Teknis: display number, verified name, business portfolio, platform (CLOUD_API), Coexistence status, connected timestamp, + 4 Technical IDs masked (WABA/Phone/Business/Template Namespace) dengan copy buttons. Modal juga tampilkan warning note bahwa access token disimpan server-side bukan localStorage. Data source: `u.meta` object (populated dari Embedded Signup). |
