# Page: PELANGGAN (`starvio-pelanggan.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

**Satu tujuan:** Lihat dan kelola semua data pelanggan — siapa yang aktif, siapa yang hampir hilang, siapa yang sudah lama tidak balik.

Halaman ini adalah CRM view — bukan untuk catat kunjungan. Catat kunjungan ada di **Catat Kunjungan**.

> ⚠️ Halaman ini TIDAK punya tombol "Catat Kunjungan" atau "Kunjungan Hari Ini". Semua pencatatan terpusat di `starvio-catat-kunjungan.html`.

---

## Layout

Dari atas ke bawah:
1. Stats Bar
2. Search + Filter Tabs
3. Customer Table
4. (Modal: Detail Pelanggan — slide-in panel atau overlay)

---

## Must-Have

### Stats Bar (atas)
- Total pelanggan
- Aktif count — warna lime
- Mendekati count — warna amber
- Hilang count — warna merah
- Semua dihitung dari `worstStatus()` tiap customer

### Search Bar
- Filter real-time berdasarkan nama atau nomor WA
- Client-side, tidak perlu submit

### Filter Tabs
- Semua | Hilang | Mendekati | Aktif
- Filter `customers[]` berdasarkan `worstStatus()`
- Tab aktif highlight warna yang sesuai (Hilang=red, Mendekati=amber, Aktif=lime)
- Bisa dikombinasikan dengan search bar

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

> Semua itu ada di halaman **Catat Kunjungan** (`starvio-catat-kunjungan.html`)

---

## Reference

- **Version acuan:** `version 2.0/starvio-pelanggan.html` — v2.1 memotong ~39% (hilang progress bar per service, riwayat reminder, edit modal)
- **Jangan pakai v2.1** sebagai acuan — terlalu stripped
- Edit modal = untuk record/koreksi services (date picker + service checklist), bukan interval customization
- nav-catat href = starvio-catat-kunjungan.html
- **Perubahan v3:** Tombol "Kunjungan Hari Ini" dan semua aksi catat kunjungan dihapus dari halaman ini — dipindah ke Catat Kunjungan

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.0, pre-select logic, tombol utama |
| 2026-03-26 | **Update v3:** Hapus semua aksi catat kunjungan (tombol "Kunjungan Hari Ini", pre-select modal, shortcut dari detail panel). Halaman ini murni CRM view. Tambah "Yang TIDAK Ada" section untuk clarity |
| 2026-03-26 | Sync: Edit modal = date picker + service checklist (recording services), bukan interval customization. Detail panel has Edit button only — no "Catat Kunjungan" shortcut. nav-catat href = starvio-catat-kunjungan.html. |
