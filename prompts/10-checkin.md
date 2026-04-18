# Page: QR CHECK-IN (`getstarvio-checkin.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Halaman publik — pelanggan scan QR dan self-register/check-in. Buka di HP pelanggan, bukan di dashboard admin.

---

## Design

- **Tidak ada sidebar, tidak ada topbar.** Halaman publik standalone.
- **Branding flip:** Logo bisnis (atau initial circle lime fallback) + nama bisnis sebagai heading utama 22px bold center. getstarvio cuma "Powered by" di footer kecil 11px muted.
- Center-aligned, `max-width:480px`
- Mobile-first — tombol besar, input nyaman di HP
- Padding: 20px horizontal, 32px atas / 24px bawah

---

## Flow — 4 State

### State 1: Input Nomor WA
- Country code selector (default +62) + field nomor WA
- **Apply global phone rules:** strip leading 0 real-time saat ngetik
- Auto-search setelah ≥ 10 digit — tidak perlu tekan tombol
- Tombol "Cari" sebagai fallback
- Spinner saat searching (200ms delay untuk simulasi)

### State 2: Pelanggan Ditemukan
- Sapa: "Halo, [nama]!" (`font-size:20px; font-weight:700`)
- **Tanggal kunjungan** — readonly, greyed out, default hari ini. Posisi: tepat setelah greeting (sebelum checklist)
- Label: "Pilih layanan hari ini:"
- Checklist semua `cats[]` — bisa pilih lebih dari satu
- **Tidak ada interval badge** pada service items — pelanggan tidak perlu tahu interval
- **Tidak ada pengingat preview/schedule** — pelanggan cukup pilih layanan saja
- **WA Consent line** (di atas tombol check-in, wajib ada untuk compliance + trust):
  - "Dengan check-in, kamu setuju menerima pengingat perawatan via WhatsApp dari **[bizName]**."
  - `font-size:12px; color:var(--ink3); text-align:center; margin:12px 0`
- Tombol "Check-in Sekarang" (disabled sampai minimal 1 layanan dipilih, height:48px, font-size:16px bold)
- Link "Bukan saya" → kembali ke State 1

### State 3: Nomor Baru
- Heading: "Hai! Isi data kamu untuk daftar" (`font-size:18px; font-weight:700`) — tone warmer, no "🔍 nomor belum terdaftar" pill
- Sub: "Pertama kali di **[bizName]**? Selamat datang!"
- Field nama (wajib)
- **Tanggal kunjungan** — readonly, greyed out, default hari ini. Posisi: tepat setelah nama
- Label "Layanan apa hari ini?"
- Checklist semua `cats[]`
- **Tidak ada interval badge** pada service items
- **Tidak ada pengingat preview/schedule**
- **WA Consent line** (sama persis seperti State 2, di atas tombol)
- Tombol "Daftar & Check-in" (disabled sampai nama + minimal 1 layanan)
- Set `via: "qr"` saat simpan ke localStorage
- Link "Coba nomor lain" → kembali ke State 1

### State 4: Sukses (final state, no scan lagi)
- Animasi checkmark hijau (SVG animated stroke, 64px)
- "Terima kasih, [nama]!" (`font-size:22px; font-weight:700`)
- "Kamu akan dapat pengingat via WhatsApp dari **[bizName]** saat waktunya perawatan berikutnya."
  - bizName di-bold biar jelas dari siapa (bukan "kami")
- Subtle hint kecil di bawah: "Kamu boleh tutup halaman ini sekarang." (`font-size:11px; color:var(--ink3)`)
- **TIDAK ada tombol "Scan lagi"** — final state, pelanggan tutup tab sendiri
- Auto-behavior: tidak ada auto-redirect, tidak ada auto-reset

### Dev Panel (development only)
- Sample customer buttons — klik untuk auto-fill nomor WA pelanggan yang ada di data
- Memudahkan testing tanpa perlu ketik nomor manual

---

## Header & Footer Branding

**Header (replace topbar lama):**
- `bizLogo` dari `getstarvio_user.bizLogo`:
  - Jika ada: tampilkan image dalam circle 80px (`border-radius:50%; object-fit:cover`)
  - Jika null: circle 80px dengan inisial huruf pertama bizName (font 32px bold, lime bg, lime-dk text)
- Nama bisnis di bawah logo: 22px bold center
- TIDAK ada logo getstarvio di header

**Footer (bawah page, after content):**
- "Powered by getstarvio" — 11px muted center, link `getstarvio.com` (target _blank)
- Margin-top 32px
- Satu-satunya tempat branding getstarvio di halaman ini

## Error State (friendly, no internal terms)

Jika `getstarvio_user` tidak ada / `cats[]` kosong:
- Icon warning (😕)
- "Halaman ini belum siap."
- "Silakan hubungi staff **[bizName]** untuk bantuan." (jika bizName tersedia)
- Fallback (no bizName): "Silakan hubungi staff untuk bantuan."
- TIDAK mention "setup layanan", "localStorage", "tidak ada data" atau term teknis apapun

## Data

- Baca `bizName`, `bizLogo`, `cats[]`, `customers[]` dari localStorage `getstarvio_user`
- Simpan langsung ke localStorage — update `customer.services[].date` atau tambah customer baru
- `via: "qr"` untuk semua customer dari halaman ini

---

## Reference

- **Version acuan:** `version 2.1/getstarvio-checkin.html` — satu-satunya version yang punya halaman checkin (tidak ada di v2.0)
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
| 2026-04-18 | **BRANDING FLIP + CONSENT.** Topbar getstarvio dihapus → ganti **biz-header** (bizLogo/initial circle 80px + bizName 22px heading). getstarvio cuma "Powered by" footer 11px muted. **WA consent line wajib** di State 2 & 3 ("Dengan check-in, kamu setuju menerima pengingat... dari [bizName]."). State 3 greeting warmer: "Hai! Isi data kamu" + "Pertama kali di [bizName]? Selamat datang!" (no "🔍 nomor belum terdaftar" pill). State 4: hapus tombol "Scan lagi" (final state, pelanggan tutup tab sendiri) + sebut bizName di message + subtle hint "boleh tutup". Error state friendly: "Halaman ini belum siap. Silakan hubungi staff [bizName]." (no internal terms). |
