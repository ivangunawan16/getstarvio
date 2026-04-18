# Page: PELANGGAN (`getstarvio-pelanggan.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

**Satu tujuan:** Lihat dan kelola semua data pelanggan — siapa yang aktif, siapa yang hampir hilang, siapa yang sudah lama tidak balik.

Halaman ini adalah CRM view — bukan untuk catat kunjungan. Catat kunjungan ada di **Catat Kunjungan**.

> ⚠️ Halaman ini TIDAK punya tombol "Catat Kunjungan" atau "Kunjungan Hari Ini". Semua pencatatan terpusat di `getstarvio-catat-kunjungan.html`.

---

## Layout

Dari atas ke bawah:
1. Single Toolbar (filter chips + sort dropdown + search)
2. Customer Table
3. (Modal: Detail Pelanggan — slide-in panel atau overlay)

---

## Must-Have

### Single Toolbar (satu baris, gantikan Stats Bar + Filter Tabs lama)

Satu baris kontrol berisi 3 elemen:

**Kiri — Filter Chips (dengan count badge):**
- `[Semua 42]` `[Aktif 28]` `[Mendekati 9]` `[Hilang 5]`
- Setiap chip punya count badge (jumlah customer di kategori itu)
- Chip active state: Semua=hitam, Aktif=lime, Mendekati=amber, Hilang=red
- Filter `customers[]` berdasarkan `worstStatus()`
- Bisa dikombinasikan dengan search

**Kanan — Sort Dropdown:**
- Trigger button: ikon sort + label aktif + chevron
- Menu opsi: "Paling Mendesak", "A–Z Nama", "Terlama", "Terbaru"
- Default: Paling Mendesak
- Klik di luar dropdown → tutup

**Kanan — Search Input:**
- Placeholder "Cari nama atau WA..."
- Filter real-time, dikombinasikan dengan filter chip aktif
- Width 180px (mobile: full width)

**Mobile (<768px):** toolbar vertikal — filter chips bisa scroll horizontal, sort+search di baris kedua full width.

> ⚠️ TIDAK ADA metric cards terpisah di atas. Count angka total ada di chip "Semua" dan di topbar sub-text ("X pelanggan terdaftar").

### Customer Table Rows
Per baris:
- Avatar (inisial huruf pertama nama)
- Nama
- Nomor WA (JetBrains Mono)
- Status badge terburuk (warna sesuai)
- Berapa hari sejak layanan terburuk
- Tombol **"Lihat"** → buka detail panel

### Customer Detail Panel/Modal (buka saat klik "Lihat")
- Nama customer, nomor WA, via (manual/QR)
- **Daftar layanan:** tiap layanan tampilkan — nama, ikon, tanggal kunjungan terakhir, interval, status badge, progress bar per service
- **Riwayat reminder** dari `reminders[]` filtered by `cxId`
- Tombol **"Edit"** — buka edit modal (hanya untuk koreksi data)
- **Tidak ada** tombol Catat Kunjungan di panel ini

### Modal Edit Pelanggan
- **For recording/correcting services:** nama, nomor WA (with country code picker), tanggal kunjungan (date picker), layanan checklist dari `cats[]`
- Checklist menampilkan semua kategori dari `cats[]` — centang layanan yang dikerjakan
- Tanggal default = hari ini, bisa diubah untuk koreksi mundur
- Simpan → update `customer.services[]` dengan tanggal yang dipilih untuk layanan yang dicentang
- Tombol Hapus Pelanggan (dengan konfirmasi)
- Tidak ada preview reminder
- Tidak ada interval override per service (interval ikut dari `cats[]`)

### Tombol "Tambah Pelanggan" (topbar)
- Buka modal add: nama, WA dengan country picker (apply global phone rules), lalu checklist layanan awal
- Set `via: "manual"`
- Setelah tambah, tampilkan di table tanpa reload

### Jika URL punya `?action=add`
- Langsung buka modal tambah pelanggan saat halaman load
- Dipanggil dari Dashboard Quick Link "Tambah Pelanggan"

---

## Yang TIDAK Ada di Halaman Ini

- Tombol "Catat Kunjungan" di manapun
- Tombol "Kunjungan Hari Ini"
- List kunjungan hari ini
- Pre-select services modal

> Semua itu ada di halaman **Catat Kunjungan** (`getstarvio-catat-kunjungan.html`)

---

## Trial Behavior — SOFT LOCK

Per TRIAL LOCK MATRIX (`00-global.md`), Pelanggan = **SOFT lock** saat `trialExpired === true`. Filosofi: data ownership — owner harus bisa lihat + export data pelanggan bahkan saat trial habis, tapi action yang konsumsi kredit/subscription di-gate.

Behavior:
- Banner merah sticky di atas konten: "Trial kamu telah berakhir — Subscribe untuk kirim pengingat otomatis" + CTA lime "Subscribe →" link ke `getstarvio-billing.html`
- Apply body class `trial-soft-locked` — CSS disable (opacity .45 + pointer-events:none) untuk:
  - Tombol "Tambah Pelanggan" (topbar)
  - Tombol "Edit" di Detail Panel
  - Tombol "Import CSV" (jika ada)
  - Modal form submit buttons
- **Export CSV tetap aktif** via `data-always` attribute — data ownership exception
- Tabel customer + detail panel tetap **fully visible** (read-only preview untuk push subscribe)
- Filter chips, sort, search tetap berfungsi (query bukan action)

Implementasi:
```js
if (U.trialExpired) {
  document.body.classList.add('trial-soft-locked')
  document.getElementById('softLockBanner').style.display = 'block'
  // Tombol dengan data-always tidak kena soft lock CSS
}
```

**TIDAK pakai `showTrialLockOverlay()`** — itu untuk hard lock. Pelanggan page punya soft-lock banner sendiri.

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-pelanggan.html` — v2.1 memotong ~39% (hilang progress bar per service, riwayat reminder, edit modal)
- **Jangan pakai v2.1** sebagai acuan — terlalu stripped
- Edit modal = untuk record/koreksi services (date picker + service checklist), bukan interval customization
- nav-catat href = getstarvio-catat-kunjungan.html
- **Perubahan v3:** Tombol "Kunjungan Hari Ini" dan semua aksi catat kunjungan dihapus dari halaman ini — dipindah ke Catat Kunjungan

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.0, pre-select logic, tombol utama |
| 2026-03-26 | **Update v3:** Hapus semua aksi catat kunjungan (tombol "Kunjungan Hari Ini", pre-select modal, shortcut dari detail panel). Halaman ini murni CRM view. Tambah "Yang TIDAK Ada" section untuk clarity |
| 2026-03-26 | Sync: Edit modal = date picker + service checklist (recording services), bukan interval customization. Detail panel has Edit button only — no "Catat Kunjungan" shortcut. nav-catat href = getstarvio-catat-kunjungan.html. |
| 2026-03-27 | Hapus Stats Bar (metric cards) + Filter Tabs + Sort Buttons terpisah. Diganti single toolbar: filter chips (dengan count badge) + sort dropdown + search input dalam satu baris. |
| 2026-04-18 | **TRIAL LOCK SPEC ADDED.** Tambah "Trial Behavior — SOFT LOCK" section sesuai TRIAL LOCK MATRIX di 00-global.md. Banner merah + disable Tambah/Edit/Import; Export CSV tetap aktif via `data-always` (data ownership). Tabel + detail panel tetap visible sebagai read-only preview. |
