# Page: ONBOARDING (`starvio-onboarding.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

> ⚠️ **FLOW LOCKED** — Flow onboarding 4 step sudah final. **Jangan ubah urutan step, jangan hapus step, jangan tambah step** kecuali ada instruksi eksplisit dari owner. Yang boleh diubah hanya copy/teks UI.

---

## Flow — 4 Step, urutan ini EXACT

### Step 1 — Hubungkan WhatsApp
- Tampilkan QR code untuk WA Web/API pairing
- Tombol "Simulasi scan" (prototype — tandai WA sebagai connected)
- Opsi kirim test WA ke nomor sendiri
- Catatan tentang Coexist mode (bisa dipakai bersamaan dengan WA personal)
- **Tidak bisa lanjut sampai WA terhubung**

### Step 2 — Profil Bisnis
- Field: Nama Bisnis (wajib, tidak bisa lanjut jika kosong), Jenis Bisnis, Nama Admin, Email (read-only dari Google), No WA Pemilik (untuk notif billing)
- **Jenis Bisnis: visual grid 8 pilihan** — bukan dropdown. Tiap pilihan punya ikon besar + label. Pilihan: Salon, Spa, Klinik/Dokter, Barbershop, Nail Studio, Bengkel, Skincare/Estetik, Lainnya
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
  - Bengkel: Ganti Oli, Servis Rutin
  - Skincare/Estetik: Facial, Chemical Peel
  - Lainnya: Layanan Utama

### Step 4 — Selesai + QR Check-in (merged)
- Tampilkan success message: "[nama], sistem aktif!"
- QR Check-in preview: QR code + URL `starvio.app/checkin/[bizSlug]`
- Tombol: Salin link, Share WA, Print QR
- Reminder credit pill: tampilkan 100 kredit gratis
- CTA: "Mulai pakai Starvio →" → redirect ke dashboard

---

## Must-Have

- Progress indicator (step 1 dari 4)
- Tombol Back antar step (kecuali step 1)
- Jangan bisa skip Step 1 (WA harus terhubung dulu)
- Step 3 boleh di-skip
- Sidebar LIGHT theme (`var(--bg2)` background) — bukan dark
- Sidebar steps: 4 items (Connect WhatsApp, Profil bisnis, Kategori layanan, Siap mulai!)
- remMax = 100 (welcome bonus untuk user baru), bukan 150 atau 300

## Reference

Flow & struktur mengacu ke built `starvio-onboarding.html`. Old v2.0 had 5 steps — v3 merged Step 3 (QR Check-in) and Step 5 (Done) into Step 4.

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal. Onboarding dimulai dari WA connect (bukan profil bisnis) |
| 2026-03-26 | Flow LOCKED — reference v2.0. Hanya copy yang boleh diubah |
| 2026-03-26 | Step 4: simplify — hapus inline edit panel & template selector. Tambah sendiri cuma Nama + Interval + Tambah. Edit detail & template nanti di Settings/Kategori |
| 2026-03-26 | Step 4: tambah preset untuk Bengkel, Skincare/Estetik, Lainnya |
| 2026-03-26 | **Major update:** 5 steps merged to 4 steps. Old Step 3 (QR Check-in) and Step 5 (Done) merged into Step 4 (Selesai + QR Check-in). Sidebar light theme. remMax=100. Progress = step N dari 4. |
