# Page: SEED DATA (`starvio-seed-data.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Dev/demo tool untuk inject dummy data ke localStorage. Dipakai untuk testing semua halaman.

---

## Must-Have

### Tombol Utama
- Tombol "Inject Data" → `localStorage.setItem('starvio_user', JSON.stringify(DUMMY))`
- Tombol "Clear Data" → `localStorage.removeItem('starvio_user')`
- Status feedback setelah aksi: "✅ Data berhasil diinjeksi" / "🗑️ Data dihapus"
- Link ke semua halaman untuk quick navigation setelah inject

---

### Credit State Switcher (tab pills — fitur utama)

Deretan tab horizontal untuk switch state kredit tanpa edit manual. Klik tab → override billing fields di localStorage secara instan → feedback "✅ State diubah ke: [nama]".

Pelanggan, kategori, dan reminder log tetap sama — hanya billing fields yang berubah.

**9 presets yang harus ada:**

| Preset | plan | subCreditsLeft | topupCreditsLeft | subRenewsAt | Kondisi yang ditest |
|---|---|---|---|---|---|
| **free-full** | free | 0 | 100 | null | User baru, welcome bonus penuh |
| **free-low** | free | 0 | 22 | null | Welcome bonus hampir habis |
| **free-critical** | free | 0 | 5 | null | Welcome bonus kritis |
| **free-empty** | free | 0 | 0 | null | Kredit kosong — automation mati |
| **sub-healthy** | subscriber | 312 | 50 | +1 bulan | Subscriber sehat |
| **sub-low** | subscriber | 18 | 50 | +1 bulan | Kredit bulanan hampir habis |
| **sub-depleted** | subscriber | 0 | 30 | +1 bulan | Sub habis, topup masih ada |
| **sub-critical** | subscriber | 0 | 7 | +1 bulan | Topup kritis |
| **sub-empty** | subscriber | 0 | 0 | +1 bulan | Semua habis |

**Visual:**
- Preset buttons/pills — klik untuk switch billing state instan
- Tab aktif (state saat ini): highlight style
- Di bawah, tampilkan ringkasan state saat ini
- `subCreditsMax` selalu di-set ke 250 untuk subscriber presets

**Implementasi (tiap tab klik):**
```js
function applyState(state) {
  const u = loadU()
  if (!u) return alert('Inject data dulu!')
  Object.assign(u, state)   // override hanya billing fields
  localStorage.setItem('starvio_user', JSON.stringify(u))
  // update UI label + highlight tab aktif
}
```

---

## DUMMY Data Requirements

Object `DUMMY` harus berisi:

**Profil:**
```js
DATA_VERSION: 4,
bizName: "Celestial Spa & Wellness",
bizType: "spa",
bizSlug: "celestial-spa-wellness",
adminName: "Cynthia",
adminEmail: "cynthia@gmail.com",
ownerWa: "628123456789",
waNum: "628987654321",
timezone: "Asia/Jakarta",
country: "ID",
// Billing fields (model baru):
plan: "subscriber",           // Cynthia sudah subscribe
subCreditsLeft: 237,          // dari 300/bulan, sudah terpakai bulan ini
subCreditsMax: 250,
topupCreditsLeft: 50,         // kredit top-up yang tidak ada expiry
subRenewsAt: "+1 month",     // dynamic — 1 bulan dari sekarang
remMax: 300,                  // max kredit subscription per bulan (NOT 100)
automationEnabled: true,
// remLeft = 237 + 50 = 287 (dihitung otomatis di loadU())
defaultInterval: 30,
billingHistory: [...],        // entries use format: { date, type, label, delta, balAfter, note }
// Types: welcome, subscription, topup, usage (Penggunaan)
notifSettings: { lowCredit:true, criticalCredit:true, subLow:true, preRenewal:true }
```

**6 Kategori (cats[]) — spa-based:**
- Facial Treatment 💆 — 30 hari
- Waxing 🪒 — 14 hari
- Manicure & Pedicure 💅 — 21 hari
- Body Massage 🧖 — 21 hari
- Hair Treatment 💇 — 45 hari
- Lash Lift & Tint 👁️ — 42 hari

**50 Pelanggan (customers[]):**
- Nama Indonesia yang realistis
- Nomor WA format `628xxx` — bervariasi
- Tiap customer punya 1–3 services (multiple service per pelanggan, tiap service interval sendiri)
- `date` bervariasi agar menghasilkan ketiga status:
  - Aktif: tanggal 5–10 hari lalu (untuk layanan 30 hari)
  - Mendekati: tanggal 22–28 hari lalu
  - Hilang: tanggal 35–60 hari lalu

**42+ Reminder log (reminders[]):**
- Mix status: terkirim, gagal, pending
- Tersebar di beberapa hari terakhir dan hari ini

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Update: 50 pelanggan (bukan 30+), multiple service per pelanggan, 42+ reminder log |
| 2026-03-26 | Update: remMax=100 (bukan 150), remLeft=63 (100 - 37 terkirim+gagal). Layout bagian atas LOCKED — jangan ubah tampilan |
| 2026-03-26 | **Update billing fields:** plan=subscriber, subCreditsLeft=218, topupCreditsLeft=45, subRenewsAt, remMax=300. remLeft computed otomatis di loadU() |
| 2026-03-26 | **Tambah Credit State Switcher:** 6 tab pills (Free OK/Tipis/Habis + Paid OK/Tipis/Kritis) untuk quick switch state tanpa edit localStorage manual |
| 2026-03-26 | Sync: plan=subscriber, subCreditsLeft=237, topupCreditsLeft=50, remMax=300. Has billingHistory array (5 entries) and notifSettings. remLeft is computed (not stored). |
| 2026-03-26 | Sync: subCreditsMax=375. 9 billing presets (not 6). billingHistory format: delta/balAfter/label/note. Dev panel has billing condition switcher. |
| 2026-03-27 | Subscription credits: 375 → 250 (flat, no early access bonus). subCreditsMax=250, remMax=250. |
