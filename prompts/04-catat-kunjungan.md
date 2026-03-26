# Page: CATAT KUNJUNGAN (`starvio-catat-kunjungan.html`)


> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

**Satu tujuan:** Catat kunjungan pelanggan hari ini — cepat, simpel, tanpa distraksi.

Halaman ini dipakai staff setiap kali ada pelanggan datang. Bukan untuk lihat data, bukan untuk edit pelanggan — hanya untuk record kunjungan.

> ⚠️ Halaman ini TIDAK punya tombol "Edit Pelanggan" atau akses ke detail CRM. Semua itu ada di halaman Pelanggan.

---

## Layout

Dua section, vertikal dari atas ke bawah:

1. **Tombol CTA besar** — "Catat Kunjungan" (selalu visible di atas)
2. **List Kunjungan Hari Ini** — semua yang sudah dicatat hari ini

---

## Must-Have

### Tombol "Catat Kunjungan" (buka modal)

**Modal — 3 tahap:**

**Tahap 1: Cari Pelanggan**
- Field search type-ahead — cari berdasarkan nama ATAU nomor WA dari `customers[]`
- Autocomplete dropdown tampilkan: avatar (inisial), nama, nomor WA (JetBrains Mono), tombol "Pilih"
- Item terakhir di dropdown selalu **"➕ Tambah pelanggan baru"** — muncul setelah hasil pencarian, atau saat query tidak ada hasilnya
- Tidak ada input manual tanpa search terlebih dahulu

**Tahap 2: Pilih Layanan** (setelah pelanggan dipilih)
- Tampilkan SEMUA layanan dari `cats[]` sebagai checklist
- Per item: ikon, nama layanan, interval (hari) — format JetBrains Mono
- Admin centang layanan yang dikerjakan hari ini — boleh lebih dari satu
- Field tanggal: default hari ini, bisa diubah (untuk koreksi input mundur)

**Tahap 3: Konfirmasi**
- Ringkasan: nama pelanggan, layanan yang dipilih, tanggal
- Tombol "Simpan Kunjungan"
- Saat simpan: update `customer.services[]` — set `date = tanggal dipilih` untuk tiap layanan yang dicentang

**Jika "➕ Tambah pelanggan baru" dipilih:**
- Field nama (wajib)
- Field nomor WA dengan country code selector — apply global phone number rules (strip leading 0)
- Set `via: "manual"`
- Lanjut langsung ke Tahap 2

---

### Section: Kunjungan Hari Ini

- List semua customer yang punya `service.date = hari ini`
- Per baris: avatar (inisial), nama (link ke `starvio-pelanggan.html?cx=[wa]`), ikon + nama layanan yang dikerjakan, jam dicatat
- Badge count di header: "Hari ini (X)"
- **Empty state:** ilustrasi + "Belum ada kunjungan hari ini" + CTA tombol "Catat Kunjungan"
- Tidak ada tombol edit atau aksi lain di baris ini — read only

---

## Yang TIDAK Ada di Halaman Ini

- QR check-in / how-to content (pindah ke Settings)
- Tombol edit pelanggan
- Detail panel / info CRM pelanggan
- Filter by status (aktif/mendekati/hilang)
- Akses ke riwayat reminder

> Semua itu ada di halaman **Pelanggan** (`starvio-pelanggan.html`)

---

## Reference

- **Version acuan:** `version 2.0/starvio-catat-kunjungan.html`
- **Search-first** adalah aturan v3 — v2.0 masih bisa direct input, v3 wajib search dulu
- Dropdown "Tambah pelanggan baru" harus selalu ada sebagai opsi di autocomplete
- Section "Kunjungan Hari Ini" di bawah — jangan dihilangkan
- **Perubahan v3:** tombol "Kunjungan Hari Ini" dari Pelanggan dihapus dan dipindah terpusat ke sini

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Catat kunjungan harus pakai search dulu |
| 2026-03-26 | Tambah Reference section — acuan v2.0 |
| 2026-03-26 | **Update v3:** Halaman ini satu-satunya tempat catat kunjungan. Semua CRM/edit ada di Pelanggan. Tambah "Yang TIDAK Ada" section untuk clarity |
| 2026-03-26 | Cleanup: `starvio-kumpulkan.html` dihapus. `starvio-catat-kunjungan.html` adalah halaman utama. nav-catat href=starvio-catat-kunjungan.html. No QR/how-to content (moved to Settings). Customer names link to pelanggan page. |
| 2026-03-26 | **FINAL:** starvio-kumpulkan.html dihapus. starvio-catat-kunjungan.html adalah halaman utama (bukan redirect). nav-catat href = starvio-catat-kunjungan.html |

