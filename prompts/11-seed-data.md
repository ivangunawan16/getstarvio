# Page: SEED DATA (`getstarvio-seed-data.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Dev/demo tool untuk inject dummy data ke localStorage. Dipakai untuk testing semua halaman.

---

## Must-Have

### Tombol Utama
- Tombol "Inject Data" → `localStorage.setItem('getstarvio_user', JSON.stringify(DUMMY))`
- Tombol "Clear Data" → `localStorage.removeItem('getstarvio_user')`
- Status feedback setelah aksi: "✅ Data berhasil diinjeksi" / "🗑️ Data dihapus"
- Link ke semua halaman untuk quick navigation setelah inject — nama link harus match sidebar (contoh: "Catat Kunjungan" bukan "Catat", "Log Reminder" bukan "Log")

---

### Credit State Switcher (tab pills — fitur utama)

Deretan tab horizontal untuk switch state kredit tanpa edit manual. Klik tab → override billing fields di localStorage secara instan → feedback "✅ State diubah ke: [nama]".

Pelanggan, kategori, dan reminder log tetap sama — hanya billing fields yang berubah.

**11 presets yang harus ada (grouped by Trial States + Subscriber States):**

**Trial States** (plan: "trial" — welcome bonus di topupCreditsLeft)

| Preset | plan | subCreditsLeft | topupCreditsLeft | trialEndsAt | Kondisi yang ditest |
|---|---|---|---|---|---|
| **trial-fresh** | trial | 0 | 100 | +14 hari | User baru sign-up, trial penuh |
| **trial-low** | trial | 0 | 22 | +5 hari | Trial berjalan, bonus hampir habis |
| **trial-expiring-soon** | trial | 0 | 45 | +2 hari | Trial 2 hari lagi (churn risk alert) |
| **trial-expired-time** | trial | 0 | 40 | -3 hari | Trial expired karena waktu (HARD LOCK) |
| **trial-expired-credit** | trial | 0 | 0 | +5 hari | Trial expired karena kredit habis (HARD LOCK) |

**Subscriber States** (plan: "subscriber")

| Preset | plan | subCreditsLeft | topupCreditsLeft | subRenewsAt | Kondisi yang ditest |
|---|---|---|---|---|---|
| **sub-healthy** | subscriber | 312 | 50 | +1 bulan | Subscriber sehat |
| **sub-low** | subscriber | 18 | 50 | +1 bulan | Kredit bulanan hampir habis |
| **sub-no-topup** | subscriber | 237 | 0 | +1 bulan | Sub OK, belum pernah topup |
| **sub-depleted** | subscriber | 0 | 30 | +1 bulan | Sub habis, topup masih ada |
| **sub-critical** | subscriber | 0 | 7 | +1 bulan | Topup kritis |
| **sub-empty** | subscriber | 0 | 0 | +1 bulan | Semua habis (automation off) |

**Visual:**
- Preset buttons/pills — klik untuk switch billing state instan
- **2 rows separator:** "Trial States" row + "Subscriber States" row (visual grouping)
- Tab aktif (state saat ini): highlight style
- Di bawah, tampilkan ringkasan state saat ini
- `subCreditsMax` selalu di-set ke 300 untuk subscriber presets
- Trial presets: auto-set `trialStartedAt = trialEndsAt - 14 days`, `trialUsed = false`

**Implementasi (tiap tab klik):**
```js
function applyState(state) {
  const u = loadU()
  if (!u) return alert('Inject data dulu!')
  Object.assign(u, state)   // override hanya billing fields
  localStorage.setItem('getstarvio_user', JSON.stringify(u))
  // update UI label + highlight tab aktif
}
```

---

## DUMMY Data Requirements

Object `DUMMY` harus berisi:

**Profil:**
```js
DATA_VERSION: 5,                       // v5 schema (migrated from v4 via loadU() auto-migration)
bizName: "Celestial Spa & Wellness",
bizType: "spa",
bizSlug: "celestial-spa-wellness",
adminName: "Cynthia",
adminEmail: "cynthia@gmail.com",
ownerWa: "628123456789",
waNum: "628987654321",
timezone: "Asia/Jakarta",
country: "ID",
// Billing fields (v5 model):
plan: "subscriber",           // Cynthia sudah subscribe ("trial" | "subscriber")
subCreditsLeft: 237,          // dari 300/bulan, sudah terpakai bulan ini
subCreditsMax: 300,           // max subscription credits per bulan
topupCreditsLeft: 50,         // kredit top-up permanent (tidak ada expiry)
subRenewsAt: "+1 month",      // dynamic — 1 bulan dari sekarang
// Trial fields (v5 required):
trialStartedAt: "-60 days",   // 60 hari lalu untuk historical subscriber
trialEndsAt: "-46 days",      // 14 hari setelah trialStartedAt
trialUsed: true,              // sudah lewat trial, sudah subscribe
remMax: 300,                  // max kredit subscription per bulan
automationEnabled: true,
// Branding & Settings (v5 fields):
bizLogo: null,                // opsional, null = fallback initial circle
avgServiceValue: 175000,      // Rp 175.000 rata-rata layanan (untuk ROI calc)
setupComplete: true,          // dashboard setup checklist: all 4 steps done
qrPosted: true,               // owner sudah print/share QR
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
| 2026-03-27 | Quick nav link names updated to match sidebar: "Catat Kunjungan" (was "Catat"), "Log Reminder" (was "Log"). |
| 2026-04-19 | **META OBJECT ADDED to DUMMY.** Tambah field `meta` lengkap di DUMMY (Cynthia subscriber) berisi realistic Meta Cloud API data dari Embedded Signup: `waba` (id: 105783024692731, templateNamespace UUID, accountReviewStatus APPROVED), `phoneNumber` (id: 698201013402857, displayNumber +62 812 3456 7890, verifiedName Celestial Spa & Wellness, qualityRating GREEN, messagingLimitTier TIER_1K, platformType CLOUD_API), `business` (id: 492187365201744, portfolioName Celestial Spa Business Portfolio, verificationStatus VERIFIED), `coexistence` (enabled true, contactsSynced + historySynced both timestamped), `assets` (pageIds, instagramAccountIds). Access token TIDAK disimpan (production server-side). Dipakai untuk populate onboarding success state + settings Meta detail modal + admin per-customer display. |
