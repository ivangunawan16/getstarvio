# Page: LOG REMINDER (`starvio-log-reminder.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Riwayat semua reminder yang sudah dikirim, gagal, atau masih pending. Untuk audit dan troubleshooting.

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

### Log Table Rows
Per baris:
- Tanggal kirim (format: Senin, 24 Mar 2026)
- Nama pelanggan
- Layanan
- Status chip: `terkirim` (lime), `pending` (blue), `gagal` (red)
- Kredit used (selalu 1, JetBrains Mono)

### Tombol Retry (di baris yang `gagal`)
- Re-jadwalkan reminder tersebut
- Potong 1 kredit dari `remLeft`
- Update status jadi `pending` dulu, lalu simulasikan `terkirim` setelah 1.5 detik (setTimeout)

---

## Reference

- **Version acuan:** `version 2.0/starvio-log-reminder.html`
- Tombol Retry hanya muncul di baris status `gagal` — jangan muncul di `terkirim` atau `pending`
- Retry logic: potong 1 kredit, update status pending → terkirim (setTimeout 1.5 detik simulasi)
- Date range filter dan status filter harus bisa dipakai bersamaan (AND, bukan OR)

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.0, retry logic |
