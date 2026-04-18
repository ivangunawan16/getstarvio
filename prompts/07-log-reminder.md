# Page: LOG REMINDER (`getstarvio-log-reminder.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.
> ⚠️ **Note penamaan:** Filename tetap `log-reminder.html` (technical name), tapi UI label = "Log Pengingat".

---

## Tujuan Halaman

Riwayat semua pengingat yang sudah dikirim, gagal, atau masih pending. Untuk audit dan troubleshooting.

---

## Must-Have

### Summary Stats (atas)
- Total terkirim bulan ini
- Total kredit digunakan bulan ini
- Jumlah yang gagal (merah jika > 0)

### Filter Bar
- Semua | Terkirim | Gagal | Pending — dengan badge count masing-masing

### Date Range Filter
- Minggu ini / Bulan ini / Custom range (date picker dari–sampai)

### Log Table Rows (Desktop)
Per baris:
- Tanggal kirim (format: Senin, 24 Mar 2026)
- Nama pelanggan (dengan avatar initials)
- Layanan
- Status chip: `terkirim` (lime), `pending` (amber), `gagal` (red)
- Kredit used (selalu 1, JetBrains Mono)
- Baris gagal tampilkan info: "Kemungkinan: nomor WA tidak aktif atau koneksi terputus"

### Mobile Responsive (<768px)
- Table disembunyikan, diganti card-based layout (mirip page Pelanggan)
- Tiap card: avatar initials, nama, layanan, status badge, waktu (JetBrains Mono), kredit
- Card punya left border berwarna sesuai status: lime (terkirim), red (gagal), amber (pending)
- Baris gagal tampilkan failure info + retry button di dalam card
- Filter bar stack vertikal di mobile

### Tombol Retry (di baris/card yang `gagal`)
- Re-jadwalkan pengingat tersebut
- Potong 1 kredit dari `subCreditsLeft` **duluan** (per global rule), baru `topupCreditsLeft` kalau sub habis
- Update status jadi `pending` dulu, lalu simulasikan `terkirim` setelah 1.5 detik (setTimeout)
- Jika `remLeft === 0` setelah deduct: block retry, show toast "Kredit habis — top up dulu"
- Trial expired: retry **disabled** dengan tooltip "Subscribe untuk kirim ulang"

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-log-reminder.html`
- Tombol Retry hanya muncul di baris status `gagal` — jangan muncul di `terkirim` atau `pending`
- Retry logic: potong 1 kredit, update status pending → terkirim (setTimeout 1.5 detik simulasi)
- Date range filter dan status filter harus bisa dipakai bersamaan (AND, bukan OR)

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.0, retry logic |
| 2026-03-27 | Mobile responsive: table hidden on <768px, replaced with card-based layout (colored left border per status). Filter bar stacks vertically. Retry deducts from topupCreditsLeft first. |
| 2026-04-18 | **Credit order CORRECTION (superseded 2026-03-27 entry):** Retry deducts from `subCreditsLeft` FIRST, lalu `topupCreditsLeft` — per global rule (00-global.md line 40). Plus: retry disabled saat `trialExpired` (SOFT lock per TRIAL LOCK MATRIX) + disabled saat `remLeft === 0`. |
