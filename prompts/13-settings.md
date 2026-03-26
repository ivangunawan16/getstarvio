# Page: SETTINGS (`starvio-settings.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Konfigurasi akun dan bisnis + QR Check-in management. Dibangun di v3 — tidak ada di versi sebelumnya. QR check-in content yang dulu ada di halaman Kumpulkan sekarang ada di sini.

---

## Must-Have

> **Layout:** Semua sections adalah collapsible accordions. Satu terbuka pada satu waktu (klik section lain → yang sebelumnya tertutup). Urutan: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone. QR Check-in default terbuka saat load.

### Section 1: QR Check-in (paling atas, default open)
Konten QR check-in yang dulu ada di halaman Kumpulkan sekarang ada di sini:
- **QR Code display** — tampilkan QR code untuk URL `starvio.app/checkin/[bizSlug]`
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
- Edit: Nama Bisnis, Jenis Bisnis (visual grid, sama seperti onboarding), Timezone
- Nama Admin (read-only)
- Email (read-only, dari Google OAuth)
- Tombol "Simpan Profil" — update localStorage

### Section 3: WhatsApp
- Nomor WA aktif: tampilkan `waNum` + status dot (hijau/merah) + label terhubung/terputus
- Tombol "Hubungkan ulang" → buka QR reconnect modal
- QR reconnect modal: scan QR + "Simulasi Terhubung" button
- Nomor WA Pemilik (`ownerWa`) — editable, apply global phone rules
- Tombol "Simpan WhatsApp"

### Section 4: Danger Zone (collapsible, paling bawah)
- "Reset semua data" → konfirmasi modal → `localStorage.removeItem('starvio_user')` → redirect ke login
- "Export data" → download `starvio_user` sebagai JSON file

---

## Yang TIDAK Ada di Halaman Ini

- WA reconnect untuk automation — itu ada di halaman **Automation** (master card)
- Catat kunjungan — itu ada di **Catat Kunjungan** (`starvio-catat-kunjungan.html`)

> Note: Settings punya QR reconnect modal untuk owner WA, tapi Automation punya QR reconnect terpisah untuk nomor yang dipakai kirim reminder.

---

## Reference

- QR Check-in section dipindahkan dari halaman Kumpulkan ke Settings
- Design mengikuti design system global (`00-global.md`) + sidebar standard
- Jenis Bisnis di edit profil: gunakan visual grid yang sama persis seperti di onboarding Step 2
- Danger Zone: wajib pakai collapsible/accordion — jangan langsung terbuka
- Reset data → redirect ke `starvio-login.html` (bukan onboarding)
- Section order: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Halaman baru — belum dibangun di versi sebelumnya |
| 2026-03-26 | Tambah Reference section — halaman baru, pattern dari onboarding visual grid |
| 2026-03-26 | **Major update:** Added QR Check-in section (top of page) — moved from old Kumpulkan page. Includes QR display, Print/Unduh, link+Salin+Share WA, Cara pakai 4 langkah, Teks siap pakai (3 blocks), Stats (Scan Hari Ini, Total via QR), Tips box. WA reconnect kept in Settings for owner WA. Section order: QR Check-in → Profil Bisnis → WhatsApp → Danger Zone. |
| 2026-03-26 | Sync with HTML: All sections are collapsible accordions (QR, Profil, WA, Danger Zone). One open at a time. QR default open on load. |
