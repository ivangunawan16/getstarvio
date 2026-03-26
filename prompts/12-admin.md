# Page: COMMAND CENTER — INTERNAL ADMIN (`starvio-admin.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.
> ⚠️ Halaman ini TIDAK dilink dari app user manapun. Akses langsung via URL.

---

## Tujuan Halaman

Dashboard internal untuk **tim Starvio** (developer/founder) untuk monitor dan kelola semua bisnis subscriber. Bukan untuk user end (pemilik salon/spa).

---

## Access

- URL terpisah: `starvio-admin.html`
- Password gate sederhana (hardcoded untuk prototype)
- Tidak dilink dari sidebar atau halaman manapun

---

## Design

- Pakai token design system yang sama (CSS variables, fonts)
- Layout standalone — **tidak ada sidebar user**
- Topbar internal sendiri dengan label "Starvio Admin ⚡" + badge "Internal"

---

## Must-Have

### Summary Cards (atas, 4 kartu)
- Total bisnis aktif — variant lime
- Total kredit terjual bulan ini — variant blue
- Total reminder terkirim bulan ini — variant neutral
- Bisnis churn bulan ini — variant red (jika ada)

### Tabel Subscriber (main section)
- List semua bisnis dari `ADMIN_DATA[]` (bukan dari `starvio_user`)
- Kolom: Nama Bisnis | Jenis | Tgl Daftar | Status | Kredit Tersisa | Reminder (bln ini) | WA Status
- Status badge per baris: `Aktif` (lime) / `Trial` (blue) / `Suspended` (amber) / `Churned` (red)
- WA status chip: `Connected` (lime pulse) / `Disconnected` (red)
- Tombol "Lihat Detail" per baris → buka modal detail

### Modal Detail Subscriber
- Nama bisnis, jenis, bizSlug, tanggal daftar
- Nama + email admin
- Kredit: `remLeft` dari `remMax` — progress bar
- Total reminder all time + bulan ini
- Tanggal top up terakhir
- Nomor WA + status koneksi + last connected timestamp
- **Aksi:**
  - Tambah Kredit Manual → input jumlah → konfirmasi → update `ADMIN_DATA`
  - Suspend Akun → konfirmasi → status jadi "Suspended"
  - Aktifkan Akun (jika suspended) → status kembali "Aktif"

### Section: Churn Risk
- Bisnis kredit habis (`remLeft = 0`) belum top up > 7 hari
- Bisnis WA putus > 3 hari
- Bisnis trial expire dalam 7 hari
- Per baris: nama bisnis + alasan risk + tombol "Follow Up" (prototype: tampilkan alert)

---

## Data

Gunakan array `ADMIN_DATA` hardcoded dengan 10–15 dummy bisnis subscriber, variasi status, level kredit, dan usage. **Jangan pakai localStorage `starvio_user`** — data admin terpisah.

Contoh entry:
```js
{
  id: "biz-001",
  bizName: "Salon Kecantikan Indah",
  bizType: "salon",
  bizSlug: "salon-kecantikan-indah",
  adminName: "Siti Rahayu",
  adminEmail: "siti@gmail.com",
  status: "aktif",           // "aktif" | "trial" | "suspended" | "churned"
  remLeft: 42,
  remMax: 100,
  reminderThisMonth: 18,
  reminderAllTime: 134,
  waStatus: "connected",     // "connected" | "disconnected"
  lastConnected: "2026-03-25T10:30:00",
  lastTopUp: "2026-03-10",
  joinedAt: "2025-11-15"
}
```

---

## Reference

- **Version acuan:** `version 2.0/starvio-command-center.html` (972 lines — paling lengkap, tapi namanya sudah diubah jadi `starvio-admin.html` di v3)
- **Theme berbeda dari halaman user:** halaman admin boleh pakai dark accent, topbar internal sendiri — tapi tetap pakai CSS variables yang sama
- **Tidak ada sidebar user** — layout standalone, bukan extend dari `bootSidebar()`
- `ADMIN_DATA[]` terpisah dari `localStorage starvio_user` — jangan dicampur
- Password gate hardcoded untuk prototype — bukan production auth

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Command Center adalah internal tool — bukan di sidebar user |
| 2026-03-26 | Tambah Reference section — acuan v2.0 command-center, renamed jadi starvio-admin.html |
