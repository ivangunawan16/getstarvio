# Page: ONBOARDING (`getstarvio-onboarding.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

> ⚠️ **FLOW LOCKED** — Flow onboarding 4 step sudah final. **Jangan ubah urutan step, jangan hapus step, jangan tambah step** kecuali ada instruksi eksplisit dari owner. Yang boleh diubah hanya copy/teks UI.

---

## Flow — 4 Step, urutan ini EXACT

### Step 1 — Hubungkan WhatsApp Business (Embedded Signup + Coexist)
- **3-state UI flow:**
  1. **Pre-connection:** "Yang akan terjadi" preview (4 langkah numbered) + checklist prerequisite + **7-day active check** + **country availability notice** + tombol biru Facebook **"Hubungkan dengan Facebook"**
  2. **Embedded Signup progress:** mockup popup Meta dengan stepper (Login FB ✓ → Pilih Business Portfolio ✓ → Masukkan nomor WA Business → Scan QR pakai WA Business app → Konfirmasi koneksi). Show demo banner: "Preview: Berikut tampilan yang akan kamu lihat di popup Meta"
  3. **Success:** card lime dengan full Meta connection data — lihat "Success state detail" di bawah
- Setelah scan QR (di popup Meta dari WA Business app pelanggan), Meta detect Coexist mode
- Opsi kirim test WA ke nomor sendiri di success state
- Catatan Coexist mode always-visible di bawah: "WA Business app kamu tetap jalan normal di HP"
- **Tidak bisa lanjut sampai WA terhubung**
- TIDAK ada lagi standalone QR code yang di-generate getstarvio — QR ada di dalam popup Meta

**Pre-connection checklist items (untuk Meta Coexistence compliance):**
1. Prerequisite checklist: **WA Business app versi 2.24.17+** (wajib per Meta), akun FB pribadi, 2-3 menit waktu
2. **7-day active radio (Meta requirement):**
   - `<7 hari`: block submit + warning amber ("Meta butuh minimum 7 hari riwayat pemakaian WA Business app untuk approve Coexistence")
   - `7-30 hari`: OK
   - `>30 hari`: recommended (default checked)
3. **Country availability note:** Coexistence didukung di Indonesia, Malaysia, Singapore, Philippines, Thailand, Vietnam, dll. TIDAK didukung di Nigeria (+234) dan South Africa (+27) per Meta restriction.

**Success state — full Meta connection data display:**

Capture dan tampilkan semua data dari Embedded Signup `data` event + subsequent Graph API calls. Layout 4 tier:

**Tier 1 (user-friendly primary info):**
- 📱 Display phone number (dari `/phone_number_id` → `display_phone_number`)
- 🏢 Verified name (dari `verified_name`) dengan lime check ✓
- 🗂️ Business Portfolio name (dari `/business_id` → `name`)

**Tier 2 (status badges horizontal):**
- Quality rating: `qualityRating` → HIGH (GREEN) / MEDIUM (YELLOW) / LOW (RED) / UNKNOWN
- Messaging Tier: `messagingLimitTier` → 1.000/10.000/100.000/Unlimited pesan/hari
- Coexistence tag: "🎯 Coexist aktif"

**Tier 3 (Coexistence sync status):**
- 🔄 Kontak tersinkron (`coexistence.contactsSynced`)
- 💬 Riwayat chat tersinkron (`coexistence.historySynced`, kalau user approve)

**Tier 4 (collapsible "Info Teknis" untuk troubleshooting):**
- WABA ID (masked: `xxxx•••2731`) + copy button
- Phone Number ID (masked) + copy
- Business Portfolio ID (masked) + copy
- Template Namespace (full, copyable)
- Platform: CLOUD_API

**Important:** Access token TIDAK ditampilkan/disimpan di localStorage — production harus server-side encrypted. Mockup cuma simulate expiry tracking.

### Step 2 — Profil Bisnis
- Field: Nama Bisnis (wajib, tidak bisa lanjut jika kosong), Jenis Bisnis, Nama Admin, Email (read-only dari Google), No WA Pemilik (untuk notif billing)
- **Jenis Bisnis: visual grid 9 pilihan** (3×3 grid di desktop, 2-col di mobile) — bukan dropdown. Tiap pilihan punya ikon besar + label. Pilihan (sesuai PRODUCT CONTEXT UMKM): Salon, Spa, Klinik, Barbershop, Nail Studio, Bengkel, Pet Grooming, Laundry, Lainnya
- Memilih jenis bisnis otomatis update preset kategori di Step 3
- **Nomor WA Pemilik:** apply global phone number rules (strip leading 0, country code selector)

### Step 3 — Kategori Layanan (opsional)
- **Preset grid** berdasarkan `bizType` — klik untuk pilih/deselect, tanpa tombol Edit
- **Tambah sendiri** — form simpel: Nama layanan + Interval (hari) + tombol Tambah. **Tidak ada** template selector atau preview pesan di onboarding (itu nanti di halaman Kategori/Settings)
- Tombol Skip tersedia — bisa diatur belakangan dari halaman Kategori
- Pre-fill suggestions berdasarkan `bizType`:
  - Salon: Keriting, Smoothing, Hair Color, Hair Mask, Blow Dry, Creambath
  - Spa: Full Body Massage, Facial, Body Scrub, Aromaterapi
  - Klinik: Konsultasi, Perawatan Kulit, Laser Treatment, Chemical Peel
  - Barbershop: Potong Rambut, Cukur Jenggot, Hair Wax
  - Nail Studio: Manicure, Pedicure, Nail Art, Gel Nails
  - Bengkel: Ganti Oli, Servis Rutin, Tune Up, Ganti Ban
  - Pet Grooming: Bath & Brush, Full Grooming, Nail Trim, Ear Cleaning
  - Laundry: Cuci Kering, Dry Clean, Setrika, Express
  - Lainnya: Layanan Utama

### Step 4 — Selesai + QR Check-in (merged)
- **Hero**: big check icon dengan glow + personalized title "[nama], setup selesai! 🎉" + sub "Sistem getstarvio sudah aktif dan siap kirim pengingat otomatis ke pelangganmu."
- **Status chips horizontal** (3 lime chips): "WhatsApp Coexist aktif" · "100 kredit gratis" · "X kategori siap"
- **Section A — Pasang QR check-in di kasir:**
  - Card lime dengan header pulse dot + label "QR Check-in — siap dipasang"
  - QR code + nama bisnis + deskripsi + link row
  - Dual buttons: Print QR + Salin Link
- **Section B — Bagikan ke pelanggan lama (opsional):**
  - Compact tip card horizontal: icon WA hijau + text + WA share button
- **Final CTA**: full-width lime "Masuk ke Dashboard"

---

## Must-Have

- Progress indicator (step 1 dari 4)
- Tombol Back antar step (kecuali step 1)
- Jangan bisa skip Step 1 (WA harus terhubung dulu)
- Step 3 boleh di-skip
- Sidebar LIGHT theme (`var(--bg2)` background) — bukan dark
- Sidebar steps: 4 items (Hubungkan WA Business, Profil Bisnis, Kategori Layanan, Siap Mulai)
- remMax = 100 (welcome bonus untuk user baru), bukan 150 atau 300

## Reference

Flow & struktur mengacu ke built `getstarvio-onboarding.html`. Old v2.0 had 5 steps — v3 merged Step 3 (QR Check-in) and Step 5 (Done) into Step 4.

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal. Onboarding dimulai dari WA connect (bukan profil bisnis) |
| 2026-03-26 | Flow LOCKED — reference v2.0. Hanya copy yang boleh diubah |
| 2026-03-26 | Step 4: simplify — hapus inline edit panel & template selector. Tambah sendiri cuma Nama + Interval + Tambah. Edit detail & template nanti di Settings/Kategori |
| 2026-03-26 | Step 4: tambah preset untuk Bengkel, Skincare/Estetik, Lainnya |
| 2026-03-26 | **Major update:** 5 steps merged to 4 steps. Old Step 3 (QR Check-in) and Step 5 (Done) merged into Step 4 (Selesai + QR Check-in). Sidebar light theme. remMax=100. Progress = step N dari 4. |
| 2026-04-18 | **Step 1 redesign — Embedded Signup + Coexist flow.** 3-state UI (pre-connection / progress mockup / success card) menggantikan standalone QR scan. Tombol biru Facebook "Hubungkan dengan Facebook" → mockup popup Meta dengan 5-step stepper (Login FB → Pilih Business Portfolio → Pilih nomor WA Business → Scan QR di popup pakai WA Business app → Konfirmasi Coexist). Success card focused (nomor WA + Coexist tag, no technical IDs). Template approval status dengan amber spinner (1-24 jam). |
| 2026-04-18 | **Step 2/3/4 cleanup.** Step 2 grouped jadi 3 sections (Tentang bisnis / Tentang kamu / Lokasi & waktu). Step 3 grouped jadi 2 sections (Pilih dari template / Tambah custom) dengan add-card responsive. Step 4 redesign total: hero centered + status chips lime + Section A (QR check-in card lime) + Section B (WA share tip card) + final CTA. Sidebar labels Indonesia. UI copy "reminder" → "pengingat". |
| 2026-04-18 | **SPEC CONSISTENCY PATCH.** Step 2 Jenis Bisnis grid 8 → 9 pilihan untuk match PRODUCT CONTEXT UMKM di 00-global.md: removed "Skincare/Estetik" + "Klinik/Dokter" label, added "Pet Grooming" + "Laundry", normalize "Klinik". Step 3 pre-fill suggestions expanded: added Bengkel extra presets (Tune Up, Ganti Ban), added Pet Grooming + Laundry presets. |
| 2026-04-19 | **META APP REVIEW READINESS.** Step 1 enhancements: (1) Pre-connection checklist tambah WA Business app versi 2.24.17+ requirement. (2) New 7-day active radio check (Meta Coexistence requirement) — `<7 hari` → block submit + amber warning. (3) Country availability notice (Nigeria +234, South Africa +27 excluded per Meta). (4) Success state totally re-structured — 4-tier layout menampilkan full Meta connection data: display_phone_number, verified_name, business portfolio name, quality rating badge, messaging tier, Coexistence sync status, + collapsible Info Teknis dengan masked WABA/phone/business IDs + template namespace (all copyable). Access token TIDAK di localStorage — production server-side. |
