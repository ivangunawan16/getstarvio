# Page: KATEGORI LAYANAN (`starvio-kategori.html`)

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
Tampilkan sebagai tombol quick-add berdasarkan `bizType`:
- **Salon:** Keriting, Smoothing, Hair Color, Hair Mask, Blow Dry, Creambath
- **Spa:** Full Body Massage, Facial, Body Scrub, Aromaterapi
- **Klinik:** Konsultasi, Perawatan Kulit, Laser Treatment, Chemical Peel
- **Barbershop:** Potong Rambut, Cukur Jenggot, Hair Wax
- **Nail Studio:** Manicure, Pedicure, Nail Art, Gel Nails

### Modal Tambah Kategori
- **Nama layanan:** text input (wajib)
- **Ikon:** `<select>` dropdown dengan 24 emoji pre-made — **tidak ada text input manual**
  - Daftar: ✨ 💆 🤲 💅 💇 🛁 🧖 🌸 💈 🦶 🎨 🔧 🛢️ ⚡ ⚗️ 🧴 🩺 🦷 🪒 👁️ 🌟 🎯 💫 🪄
- **Interval:** number input (hari) — default dari `defaultInterval`
- **Template WA:** `<select>` dropdown dengan 5 template pre-made + preview body pesan
  - **Tidak bisa edit konten template** — hanya bisa SELECT
  - Template options:
    1. **Reminder balik** (`reminder_return`) — gentle reminder untuk kembali
    2. **Ajakan santai** (`soft_invite`) — tone casual/friendly
    3. **Reminder + penawaran** (`promo_nudge`) — sebut penawaran/diskon
    4. **Check-in personal** (`care_checkin`) — gimana pengalamannya?
    5. **Gentle urgency** (`urgency_light`) — soft urgency reminder

### Modal Edit Kategori
- Field sama persis seperti modal tambah, di-prefill dengan data yang sudah ada

### Hapus Kategori
- Konfirmasi dulu sebelum hapus
- Jika ada customer yang punya layanan ini, tampilkan warning: "X pelanggan punya layanan ini — tetap hapus?"

---

## Reference

- **Version acuan:** `version 2.1/starvio-kategori.html` — v2.1 punya icon picker dan template selector yang lebih baik dari v2.0
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
