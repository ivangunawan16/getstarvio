# Page: BILLING (`getstarvio-billing.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Kelola subscription dan kredit pengingat. **ROI framing** — pengingat bukan "biaya" tapi "peluang membawa pelanggan balik". Lihat status plan, top up kredit extra, rekomendasi cerdas, riwayat transaksi.

---

## BILLING MODEL (wajib dipahami sebelum build)

```
┌─────────────────────────────────────────────────────────────┐
│  WELCOME BONUS    │  100 kredit gratis saat join             │
│                   │  Berlaku 1x, tidak ada expiry            │
├─────────────────────────────────────────────────────────────┤
│  SUBSCRIPTION     │  Rp 249.000 / bulan (Early Access 50%)   │
│  (opsional)       │  Harga normal Rp 499.000 (coret)         │
│                   │  Include 300 kredit/bulan                │
│                   │  ⚠️ TIDAK rollover ke bulan berikutnya   │
│                   │  Reset tanggal yang sama tiap bulan      │
│                   │  Garansi 30 hari uang kembali            │
├─────────────────────────────────────────────────────────────┤
│  TOP-UP           │  Beli kredit extra kapan saja            │
│  (pay-as-you-go)  │  ✅ TIDAK ada expiry                     │
│                   │  Dipakai setelah kredit sub habis        │
│                   │  200 kredit  — Rp 399.000  (Rp 1.995/k)  │
│                   │  500 kredit  — Rp 749.000  (Rp 1.498/k)  │
│                   │  1000 kredit — Rp 1.299.000(Rp 1.299/k)  │
└─────────────────────────────────────────────────────────────┘
```

**Urutan pemakaian kredit:**
1. Kredit subscription (`subCreditsLeft`) — habis duluan (ada expiry)
2. Kredit top-up (`topupCreditsLeft`) — dipakai setelah sub habis (tidak ada expiry)

**`remLeft` = `subCreditsLeft + topupCreditsLeft`** — total kredit yang bisa dipakai

**User states:**
- **New / Trial:** `plan: "free"` — punya welcome bonus 100 kredit, belum subscribe
- **Subscriber aktif:** `plan: "subscriber"` — bayar 249k/bulan (Early Access), dapat 300 kredit di-refresh tiap bulan
- **Subscriber + top-up:** punya kedua tipe kredit sekaligus

---

## DATA SCHEMA TAMBAHAN (field baru untuk billing)

Tambahkan field ini ke `getstarvio_user`:

```js
{
  plan: "free" | "subscriber",       // status subscription
  subCreditsLeft: number,            // sisa kredit dari subscription bulan ini (reset bulanan)
  subCreditsMax: 300,
  topupCreditsLeft: number,          // kredit top-up (tidak ada expiry)
  subRenewsAt: "ISO string | null",  // tanggal renewal berikutnya (null jika free)
  // remLeft = subCreditsLeft + topupCreditsLeft (computed, bukan disimpan)
}
```

> **Catatan:** `remLeft` di schema global tetap ada tapi selalu dihitung ulang:
> `remLeft = (subCreditsLeft || 0) + (topupCreditsLeft || 0)`

---

## Must-Have

### Section 1: Status Plan (paling atas)

**Jika `plan === "free"`:**
- Badge: "Paket Gratis" (grey)
- Teks: "Kamu sedang memakai welcome bonus — `remLeft` kredit tersisa"
- CTA prominent: tombol **"Subscribe — ~~Rp 499.000~~ Rp 249.000/bulan (300 kredit)"** dengan harga normal coret + diskon Early Access
- Subtext: "Dapatkan 300 pengingat/bulan + akses semua fitur. Garansi 30 hari uang kembali."

**Jika `plan === "subscriber"`:**
- Badge: "Subscriber Aktif" (lime)
- Teks: "Renewal: `subRenewsAt` (format: 15 April 2026)"
- Tombol kecil: "Batalkan Langganan" (link style, bukan tombol merah — prototype: konfirmasi dulu)

---

### Section 2: Ringkasan Kredit

Tampilkan dua baris kredit secara visual terpisah:

**Kredit Subscription** (hanya tampil jika `plan === "subscriber"`)
- Label: "Kredit Bulanan" + badge "Reset tiap bulan"
- Angka: `subCreditsLeft` dari `subCreditsMax` (300)
- Progress bar
- Warning jika < 30: "Kredit bulanan hampir habis — tidak rollover ke bulan depan"

**Kredit Top-Up**
- Label: "Kredit Top-Up" + badge "Tidak ada expiry ✓"
- Angka: `topupCreditsLeft`
- Jika 0: tampilkan "–" dengan CTA "Tambah Kredit"

**Total Usable** (di bawah keduanya)
- Besar, bold: `remLeft` total kredit tersisa
- Warna sesuai state:
  - ≥30 → lime (`var(--lime-dk)`)
  - 10–29 → amber (`var(--amber-dk)`)
  - 1–9 → red (`var(--red-dk)`) + pulse animation
  - 0 → dark (`var(--ink)`) + label "Automation dihentikan"

---

### Section 3: Top Up Kredit Extra

Header: "Top Up Kredit Extra" dengan subtext "Beli paket sekali, kredit tidak ada expiry — semakin besar paket, semakin murah per kreditnya."

3 pilihan paket (card) — **dinamis dari `getstarvio_user.planConfig`** (fallback ke default jika tidak ada):
- Default tiers (flat pricing, NO bonus calculation):
  - 200 kredit  — Rp 399.000   (Rp 1.995/kredit)
  - 500 kredit  — Rp 749.000   (Rp 1.498/kredit) — badge "Terlaris" + "Hemat 25%"
  - 1.000 kredit — Rp 1.299.000 (Rp 1.299/kredit) — badge "Hemat 35%"
- Jika admin mengubah pricing via `getstarvio-admin.html` Plan Config, billing otomatis reflect perubahan
- Per-credit dan label dihitung dari `planConfig.tiers[]` (tidak ada lagi `topupPrice`/basePrice/bonus concept)

**Implementasi:**
```js
var PACKAGES = buildPackages()  // reads planConfig.tiers[], falls back to flat defaults
// SUB_PRICE, SUB_PRICE_NORMAL, SUB_CREDITS also read from planConfig
```

- Card yang dipilih: highlight lime border
- Tombol "Top Up Sekarang" (prototype: simulasikan, update `topupCreditsLeft`, tambah ke riwayat)
- Keterangan: "Pembayaran via transfer bank / QRIS" (prototype: skip payment flow)

---

### Section 4: Auto Top Up Toggle

- Label: "Top Up Otomatis"
- Enable top up otomatis saat `topupCreditsLeft` di bawah threshold
- Input threshold: "Top up jika kredit top-up < [X]"
- Dropdown: pilih paket yang akan dibeli otomatis
- Subtext: "Kredit subscription tidak di-auto-top-up — hanya kredit extra"
- **Explicit "Simpan Pengaturan" button** — tidak auto-save saat threshold/paket berubah

---

### Section 5: Recommendation Engine (contextual)

Tampilkan banner rekomendasi berdasarkan kondisi:

| Kondisi | Rekomendasi |
|---|---|
| `plan === "free"` + `remLeft` < 30 | "Subscribe sekarang — dapat 300 kredit fresh tiap bulan (Early Access 50% off)" |
| `plan === "subscriber"` + sub habis + topup > 0 | "Kredit bulanan habis — kredit top-up kamu akan dipakai" |
| `plan === "subscriber"` + topup = 0 + sub < 30 | "Mau ada cadangan? Top up kredit extra sekarang" |
| `remLeft` = 0 | 🚨 Banner merah: "Automation dihentikan — isi kredit untuk lanjutkan" |

Copy harus ROI-framed: **"Setiap pengingat = peluang pelanggan balik"** — bukan "kredit hampir habis"

---

### Section 6: Prediction Engine

- "Dengan pemakaian rata-rata kamu, kredit **[tipe yang akan habis duluan]** akan habis dalam **X hari**"
- Kalkulasi: `subCreditsLeft / (totalReminderBulanIni / hariDalamBulan)`
- Jika subscriber: hitung kapan sub credits habis vs renewal date → tampilkan yang mana lebih dulu

---

### Section 7: Riwayat Transaksi

Tabel dengan kolom: Tanggal, Tipe, Jumlah, Saldo Setelah, Keterangan

| Tipe | Warna | Contoh Keterangan |
|---|---|---|
| Top Up | hijau + | "Top Up 500 kredit — Rp 749.000" |
| Subscription | biru + | "Renewal bulanan — 300 kredit (Early Access 50% off)" |
| Welcome Bonus | lime + | "Welcome bonus 100 kredit" |
| Penggunaan | merah – | "Pengingat terkirim ke Mia" |

---

### Section 8: Pengaturan Notifikasi

- Notif WA ke: `ownerWa` — tampilkan nomor (read-only)
- Checkbox:
  - ☑ Saat kredit total Rendah (< 30)
  - ☑ Saat kredit total Kritis (< 10)
  - ☑ Saat kredit subscription hampir habis (< 60 dari 300)
  - ☑ 3 hari sebelum renewal

---

## Known Bugs (dari versi sebelumnya — harus di-fix di v3)

1. `getRecommendation()` — kedua branch return `'topup'` padahal seharusnya satu branch return `'upgrade'` → sekarang diperbaiki dengan logika subscription vs topup
2. Semua CTA billing masih pakai `alert()` — ganti dengan modal konfirmasi proper
3. ~~Free user bisa top-up sebelum upgrade~~ → **RESOLVED:** free user boleh top-up tanpa harus subscribe dulu. Top-up dan subscription adalah dua hal terpisah.
4. Belum ada billing history / invoice → implement di Section 7

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-billing.html` — v2.1 memotong ~53% konten billing (ROI framing, prediction engine, auto top up hilang)
- **Jangan pakai v2.1 billing** — terlalu stripped
- Credit state colors harus konsisten dengan global: lime/amber/red+pulse/dark
- Known bugs di atas harus di-fix saat build v3
- **Subscription model baru** — v2.0 tidak punya ini, build dari scratch untuk sections 1 & 2

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah ROI framing, recommendation engine, prediction engine, known bugs dari doc lama |
| 2026-03-26 | Tambah Reference section — acuan v2.0, warning jangan pakai v2.1 |
| 2026-03-26 | **MAJOR UPDATE:** Tambah subscription model Rp 250.000/bulan + 300 kredit (no rollover) + top-up pay-as-you-go (no expiry) + welcome bonus 100 kredit. Update data schema, semua sections billing, resolve known bug #3 |
| 2026-03-26 | Sync with HTML: subCreditsMax=375 (250 base + 125 early access +50%). Top-up packages: 300 (Rp 250k, +20%), 625 (Rp 500k, +25%), 1500 (Rp 1jt, +50%). Base price Rp 1.000/kredit. Auto top-up has explicit "Simpan Pengaturan" button. |
| 2026-03-27 | Subscription credits: 375 → 250 (flat, no early access bonus on subscription). subCreditsMax=250. Early access +50% applies ONLY to top-up packages. |
| 2026-03-27 | Top-up packages now dynamic: reads from `getstarvio_user.planConfig` (set by admin page). `buildPackages()` computes labels/bonuses/per-kredit from planConfig. SUB_PRICE and SUB_CREDITS also read from planConfig. Falls back to hardcoded defaults if no planConfig. |
| 2026-04-18 | **MAJOR PRICING UPDATE.** Subscription Rp 249.000/bulan (Early Access 50% off, normal Rp 499.000) for 300 kredit/bulan (was 250). subCreditsMax=300. Top-up: flat tier pricing — 200/500/1.000 kredit @ Rp 399k/749k/1.299k (no more "+X% bonus" claim). Per-credit Rp 1.995/1.498/1.299. Removed `topupPrice`/basePrice concept. Added `subPriceNormal` to planConfig. Subscribe modal shows price-old strikethrough + Early Access discount line. UI copy "reminder" → "pengingat". Trust line: "Garansi 30 hari uang kembali". |
