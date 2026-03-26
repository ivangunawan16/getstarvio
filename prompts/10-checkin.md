# Page: QR CHECK-IN (`starvio-checkin.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Halaman publik — pelanggan scan QR dan self-register/check-in. Buka di HP pelanggan, bukan di dashboard admin.

---

## Design

- **Tidak ada sidebar.** Topbar hanya tampilkan logo Starvio + nama bisnis.
- Center-aligned, max-width 480px
- Mobile-first — tombol besar, input nyaman di HP

---

## Flow — 4 State

### State 1: Input Nomor WA
- Country code selector (default +62) + field nomor WA
- **Apply global phone rules:** strip leading 0 real-time saat ngetik
- Auto-search setelah ≥ 10 digit — tidak perlu tekan tombol
- Tombol "Cari" sebagai fallback
- Spinner saat searching (200ms delay untuk simulasi)

### State 2: Pelanggan Ditemukan
- Sapa: "Halo, [nama]! 👋"
- **Tanggal kunjungan** — readonly, greyed out, default hari ini. Posisi: tepat setelah greeting/nama (sebelum checklist layanan)
- Label: "Pilih layanan hari ini:"
- Checklist semua `cats[]` — bisa pilih lebih dari satu
- **Tidak ada interval badge** pada service items — pelanggan tidak perlu tahu interval
- **Tidak ada reminder preview/schedule** — pelanggan cukup pilih layanan saja
- Tombol "Check-in Sekarang" (disabled sampai minimal 1 layanan dipilih)
- Link "Bukan saya" → kembali ke State 1

### State 3: Nomor Baru
- "Nomor baru 😊 — Isi data kamu untuk daftar"
- Field nama (wajib)
- **Tanggal kunjungan** — readonly, greyed out, default hari ini. Posisi: tepat setelah nama
- Label "Layanan apa hari ini?"
- Checklist semua `cats[]`
- **Tidak ada interval badge** pada service items
- **Tidak ada reminder preview/schedule**
- Tombol "Daftar & Check-in" (disabled sampai nama + minimal 1 layanan)
- Set `via: "qr"` saat simpan ke localStorage
- Link "Coba nomor lain" → kembali ke State 1

### State 4: Sukses
- Animasi checkmark hijau (SVG animated stroke)
- "Terima kasih, [nama]!"
- "Kami akan kirim reminder ke WA kamu saat waktunya kembali."
- **Tidak ada reminder list/schedule** — cukup pesan sederhana saja
- Tombol "Scan lagi" → kembali ke State 1 (untuk pelanggan berikutnya)

### Dev Panel (development only)
- Sample customer buttons — klik untuk auto-fill nomor WA pelanggan yang ada di data
- Memudahkan testing tanpa perlu ketik nomor manual

---

## Data

- Baca `bizName` dari localStorage `starvio_user.bizName`
- Jika tidak ada data: tampilkan error state "Bisnis ini belum setup layanan. Silakan hubungi staff."
- Simpan langsung ke localStorage — update `customer.services[].date` atau tambah customer baru

---

## Reference

- **Version acuan:** `version 2.1/starvio-checkin.html` — satu-satunya version yang punya halaman checkin (tidak ada di v2.0)
- **Tidak ada sidebar** — halaman publik, tampilan standalone
- Auto-search setelah ≥10 digit — tidak perlu tekan tombol (ini penting untuk UX mobile)
- `via: "qr"` bukan `"link"` — perbedaan kecil tapi krusial untuk analytics

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. `via` disimpan sebagai `"qr"` (bukan `"link"` seperti di v2) |
| 2026-03-26 | Tambah Reference section — acuan v2.1, auto-search behavior |
| 2026-03-26 | Sync with HTML: No interval badge on services, no reminder preview/schedule, date readonly greyed default today after greeting/name, success = "Terima kasih" + "Scan lagi" (no reminder list), dev panel with sample customer buttons |
