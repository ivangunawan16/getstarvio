# Page: KATEGORI LAYANAN (`getstarvio-kategori.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Kelola semua kategori layanan bisnis — tambah, edit, hapus. Kategori ini jadi dasar untuk pilihan layanan di catat kunjungan dan checkin.

---

## Must-Have

### Grid Kategori (2-column layout)
- Layout: `grid-template-columns: 1fr 1fr` — 2-column grid cards (single column on mobile)
- Tiap kategori card: colored icon circle, nama, interval badge (JetBrains Mono), customer count, template name
- Stats row per card: "X pelanggan" + "tiap Y hari"
- Tombol Edit & Delete per card
- Jika `cats[]` kosong: tampilkan empty state + saran pre-fill berdasarkan `bizType`

### Pre-fill Suggestions (muncul jika `cats[]` kosong)
Tampilkan sebagai tombol quick-add berdasarkan `bizType` (match daftar di onboarding Step 3):
- **Salon:** Keriting, Smoothing, Hair Color, Hair Mask, Blow Dry, Creambath
- **Spa:** Full Body Massage, Facial, Body Scrub, Aromaterapi
- **Klinik:** Konsultasi, Perawatan Kulit, Laser Treatment, Chemical Peel
- **Barbershop:** Potong Rambut, Cukur Jenggot, Hair Wax
- **Nail Studio:** Manicure, Pedicure, Nail Art, Gel Nails
- **Bengkel:** Ganti Oli, Servis Rutin, Tune Up, Ganti Ban
- **Pet Grooming:** Bath & Brush, Full Grooming, Nail Trim, Ear Cleaning
- **Laundry:** Cuci Kering, Dry Clean, Setrika, Express
- **Lainnya:** (tampilkan empty state tanpa preset — biarkan owner tambah custom)

### Modal Tambah Kategori
- **Nama layanan:** text input (wajib)
- **Ikon:** `<select>` dropdown dengan 24 emoji pre-made — **tidak ada text input manual**
  - Daftar: ✨ 💆 🤲 💅 💇 🛁 🧖 🌸 💈 🦶 🎨 🔧 🛢️ ⚡ ⚗️ 🧴 🩺 🦷 🪒 👁️ 🌟 🎯 💫 🪄
- **Interval:** number input (hari) — default dari `defaultInterval`
- **Template WA:** `<select>` dropdown dengan 5 template aftercare pre-made + preview body pesan
  - **Tidak bisa edit konten template** — hanya bisa SELECT (edit template di admin panel)
  - **Placeholder format Meta Cloud API:** `{{1}}`-`{{4}}` (positional)
    - `{{1}}` = Nama customer · `{{2}}` = Treatment · `{{3}}` = Tanggal kunjungan · `{{4}}` = Nama bisnis
  - Template options (semua UTILITY-compliant, APPROVED Meta):
    1. **`aftercare_followup_1`** — formal "sudah berjalan dengan baik"
    2. **`aftercare_followup_2`** — terima kasih + jadwal lanjutan
    3. **`aftercare_followup_3`** — follow-up casual
    4. **`aftercare_followup_4`** — semoga puas + info jadwal
    5. **`aftercare_followup_5`** — tanya hasil + opsi keluhan
  - Preview render dengan data sungguhan (sample customer name, biz name, date, dll), bukan raw `{{1}}`

### Modal Edit Kategori
- Field sama persis seperti modal tambah, di-prefill dengan data yang sudah ada

### Hapus Kategori
- Konfirmasi dulu sebelum hapus
- Jika ada customer yang punya layanan ini, tampilkan warning: "X pelanggan punya layanan ini — tetap hapus?"

---

## Reference

- **Version acuan:** `version 2.1/getstarvio-kategori.html` — v2.1 punya icon picker dan template selector yang lebih baik dari v2.0
- **Ikon = dropdown pre-made** — AI sering generate text input atau emoji picker bebas, jangan. List emoji sudah fixed di spec ini.
- **Template = SELECT only** — konten template tidak bisa diedit pengguna
- Pre-fill suggestions hanya muncul saat `cats[]` kosong — jangan selalu tampil

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Ikon wajib dropdown pre-made (bukan input manual). Template hanya SELECT, tidak bisa diedit |
| 2026-03-26 | Tambah Reference section — acuan v2.1, icon/template constraint |
| 2026-03-26 | Sync: Icon = `<select>` dropdown 24 emojis (not text input). Template = `<select>` 5 options (not 4). Layout = 2-column grid cards. Emoji list updated to match HTML. |
| 2026-04-18 | **TEMPLATE OVERHAUL.** Replaced 5 old reminder templates with 5 utility-compliant aftercare templates (`aftercare_followup_1`-`_5`). Placeholder format Meta Cloud API: `{{1}}`-`{{4}}`. Variable mapping: nama/treatment/tanggal/bisnis. Preview render dengan data sungguhan. |
| 2026-04-19 | **REMOVE {{5}} TIMING.** Variables reduced to 4. Removed timing variable + `cats[].timing` field reference. |
| 2026-04-18 | **SPEC CONSISTENCY PATCH.** Pre-fill suggestions expanded untuk match bizType options di onboarding + PRODUCT CONTEXT: added Bengkel (Tune Up, Ganti Ban), Pet Grooming (Bath & Brush, Full Grooming, Nail Trim, Ear Cleaning), Laundry (Cuci Kering, Dry Clean, Setrika, Express), Lainnya (empty state no preset). |
