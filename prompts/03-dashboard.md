# Page: DASHBOARD (`getstarvio-dashboard.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Halaman utama setelah login. **Action-first** — elemen utama adalah aksi apa yang perlu dilakukan hari ini, bukan sekadar angka. Metrics ada tapi bukan yang pertama dilihat mata.

---

## Must-Have

### Greeting Card (background `var(--ink)` / dark)
- Teks: "Selamat pagi/siang/sore, [adminName]!" — berdasarkan jam (pagi <11, siang 11–14, sore ≥14)
- Tanggal hari ini
- 3 tile angka di kanan:
  - Kunjungan Hari Ini — hitung customer yang ada `service.date = hari ini`
  - Kredit Tersisa — `remLeft`, warna lime
  - Pelanggan Hilang — hitung customer dengan `worstStatus() === 'hilang'`

### Metrics Grid (4 kartu)
- Total Pelanggan — variant `neutral`
- Kunjungan Bulan Ini — variant `blue`
- Reminder Terkirim Bulan Ini — variant `lime`
- Pelanggan Hilang — variant `red` jika >0, `neutral` jika 0

### Section: Pelanggan Perlu Perhatian
- Tampilkan customer dengan status `hilang` atau `mendekati` (berdasarkan `worstStatus()`)
- Per baris: avatar, nama, status badge, nama layanan terburuk + berapa hari overdue
- Link "Lihat semua →" ke `getstarvio-pelanggan.html`
- Empty state jika semua pelanggan aktif

### Section: Jadwal Reminder Hari Ini
- List reminder dari `reminders[]` yang `scheduledAt` = hari ini
- Per baris: nama pelanggan, layanan, status chip (terkirim/pending/gagal)
- Link "Lihat log →" ke `getstarvio-log-reminder.html`
- Empty state jika tidak ada reminder hari ini

### Quick Links (3 kartu)
- Catat Kunjungan → `getstarvio-catat-kunjungan.html`
- Tambah Pelanggan → `getstarvio-pelanggan.html` (dengan add modal langsung terbuka via URL param `?action=add`)
- Atur Automation → `getstarvio-automation.html`

### Topbar
- WA status chip: Aktif (lime pulse) / Terputus (red)
- Baca dari `localStorage waNum` — jika ada = aktif, jika kosong = terputus

### Credit Alert
- Jika `remLeft < 10`: tampilkan warning banner di bawah greeting card
- Copy: "Kredit hampir habis — [X] kredit tersisa. Top up sekarang →" link ke billing.html

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
