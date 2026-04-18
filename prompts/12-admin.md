# Page: COMMAND CENTER — INTERNAL ADMIN (`getstarvio-admin.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.
> ⚠️ Halaman ini TIDAK dilink dari app user manapun. Akses langsung via URL.

---

## Tujuan Halaman

Dashboard internal untuk **tim getstarvio** (developer/founder) untuk monitor dan kelola semua bisnis subscriber. Bukan untuk user end (pemilik salon/spa).

---

## Access

- URL terpisah: `getstarvio-admin.html`
- Password gate sederhana (hardcoded untuk prototype)
- Tidak dilink dari sidebar atau halaman manapun

---

## Design

- Pakai token design system yang sama (CSS variables, fonts)
- Layout standalone — **tidak ada sidebar user**
- Topbar internal sendiri dengan label "getstarvio Admin ⚡" + badge "Internal"

---

## Must-Have

### Summary Cards (atas, 4 kartu)
- Total bisnis aktif — variant lime
- Total kredit terjual bulan ini — variant blue
- Total pengingat terkirim bulan ini — variant neutral
- Bisnis churn bulan ini — variant red (jika ada)

### Tabel Subscriber (main section)
- List semua bisnis dari `ADMIN_DATA[]` (bukan dari `getstarvio_user`)
- Kolom: Nama Bisnis | Jenis | Tgl Daftar | Status | Kredit Tersisa | Pengingat (bln ini) | WA Status
- Status badge per baris: `Aktif` (lime) / `Trial` (blue) / `Suspended` (amber) / `Churned` (red)
- WA status chip: `Connected` (lime pulse) / `Disconnected` (red)
- Tombol "Lihat Detail" per baris → buka modal detail

### Modal Detail Subscriber
- Nama bisnis, jenis, bizSlug, tanggal daftar
- Nama + email admin
- Kredit: `remLeft` dari `remMax` — progress bar
- Total pengingat all time + bulan ini
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

### Tab: Plan Config — Subscription & Top-Up Pricing (editable)

**Subscription card** (editable):
- Harga normal (Rp) — input number, default 499.000
- Harga Early Access (Rp) — input number, default 249.000
- Kredit per bulan — input number, default 300
- Auto-show: diskon % (auto-calculated dari normal vs early access)

**Top-Up Pricing card** (editable):
- **3 Paket Tiers** — flat pricing, masing-masing punya:
  - Harga (Rp) — input number
  - Jumlah kredit — input number
  - Per-kredit (Rp) — auto-calculated display (price ÷ credits)
- Default tiers (no bonus calculation):
  - Tier 1: Rp 399.000 → 200 kredit (Rp 1.995/kredit)
  - Tier 2: Rp 749.000 → 500 kredit (Rp 1.498/kredit) — label "Terlaris"
  - Tier 3: Rp 1.299.000 → 1.000 kredit (Rp 1.299/kredit) — label "Hemat 35%"

**Simpan Konfigurasi button:**
- Menyimpan plan config (freeBonus, subCredits, subPrice, subPriceNormal, tiers) ke `getstarvio_user.planConfig` di localStorage
- Billing page membaca `planConfig` secara dinamis — perubahan di admin langsung tercermin di billing
- Removed `topupPrice` (basePrice concept) — tier pricing sudah flat

**planConfig schema yang disimpan:**
```js
{
  freeBonus: 100,           // welcome bonus credits
  subCredits: 300,          // subscription credits per month
  subPrice: 249000,         // subscription price per month (Early Access)
  subPriceNormal: 499000,   // subscription price normal (untuk display coret)
  tiers: [
    { price: 399000,  credits: 200 },
    { price: 749000,  credits: 500,  label: "Terlaris" },
    { price: 1299000, credits: 1000, label: "Hemat 35%" }
  ]
}
```

**Boot:** `loadPlanConfig()` dipanggil setelah login berhasil untuk populate input fields dari localStorage.

---

## Data

Gunakan array `ADMIN_DATA` hardcoded dengan 10–15 dummy bisnis subscriber, variasi status, level kredit, dan usage. **Jangan pakai localStorage `getstarvio_user`** untuk data subscriber — data admin terpisah. Tapi `planConfig` disimpan ke `getstarvio_user` karena dipakai oleh billing page.

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
  reminderThisMonth: 18,    // count of pengingat sent this month
  reminderAllTime: 134,     // count of pengingat all-time
  waStatus: "connected",     // "connected" | "disconnected"
  lastConnected: "2026-03-25T10:30:00",
  lastTopUp: "2026-03-10",
  joinedAt: "2025-11-15"
}
```

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-command-center.html` (972 lines — paling lengkap, tapi namanya sudah diubah jadi `getstarvio-admin.html` di v3)
- **Theme berbeda dari halaman user:** halaman admin boleh pakai dark accent, topbar internal sendiri — tapi tetap pakai CSS variables yang sama
- **Tidak ada sidebar user** — layout standalone, bukan extend dari `bootSidebar()`
- `ADMIN_DATA[]` terpisah dari `localStorage getstarvio_user` — jangan dicampur
- Password gate hardcoded untuk prototype — bukan production auth

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat. Command Center adalah internal tool — bukan di sidebar user |
| 2026-03-26 | Tambah Reference section — acuan v2.0 command-center, renamed jadi getstarvio-admin.html |
| 2026-03-27 | Top-Up Pricing tiers now editable (price + credits inputs). Bonus % auto-recalculates. savePlanConfig() persists to getstarvio_user.planConfig in localStorage. loadPlanConfig() populates fields on boot. Billing page reads planConfig dynamically. |
| 2026-04-18 | **MAJOR PRICING UPDATE.** New tiers: Rp 399k/200, Rp 749k/500 ("Terlaris"), Rp 1.299k/1000 ("Hemat 35%"). FLAT pricing — removed bonus % calculation (no more `topupPrice`/basePrice concept). Subscription card now editable: subPrice (249k Early Access), subPriceNormal (499k coret), subCredits (300). Auto-show diskon % from normal vs early access. Plan config schema adds `subPriceNormal`. UI copy "reminder" → "pengingat". |
