# getstarvio v3 — GLOBAL RULES
**Paste file ini PERTAMA sebelum file page manapun.**

---

## PRIME DIRECTIVE

Kamu sedang membangun halaman untuk **getstarvio** — WhatsApp-based customer return reminder SaaS untuk **UMKM Indonesia** dengan pelanggan berulang (salon, spa, klinik, barbershop, nail studio, bengkel, pet grooming, laundry, dll.).

**Tiga aturan yang override segalanya:**
1. **Lock design.** Setiap pixel ikuti `getstarvio-design-system.md`. Jangan ciptakan warna, font, spacing, atau komponen yang tidak ada di sana. Kalau tidak yakin, tanya — jangan tebak.
2. **Lock data schema.** Semua page baca dari dan tulis ke satu localStorage key: `getstarvio_user`. Schema ada di bawah. Jangan tambah key baru atau ubah nama field.
3. **Lock flow.** Flow per page didefinisikan di file masing-masing. Jangan tambah step, hapus step, atau ubah urutan tanpa diminta.

---

## PRODUCT CONTEXT

**Yang dilakukan getstarvio:** Membantu UMKM Indonesia melacak kapan tiap pelanggan terakhir kali datang untuk tiap layanan, lalu otomatis kirim **pengingat WhatsApp** saat waktunya balik. Pelanggan check-in mandiri pakai QR (catat manual oleh staff = opsional).

**Terminologi UI:** Selalu pakai **"pengingat"** di user-facing copy (Bahasa Indonesia), bukan "reminder". Variabel/konstanta JS boleh tetap pakai `reminder`.

**WhatsApp integration:** Pakai **Meta Cloud API + Coexistence Mode** (resmi). Customer onboard via Embedded Signup (login FB → pilih nomor WA Business → scan QR di popup Meta). Nomor WA Business customer tetap jalan normal di HP — getstarvio cuma numpang kirim pengingat otomatis.

**Trust commitments (boleh diklaim, ga overpromise):**
- ✅ Garansi 30 hari uang kembali
- ✅ Free trial 100 kredit, tanpa kartu kredit
- ✅ Bisa berhenti kapan saja
- ❌ JANGAN klaim: "diskon selamanya", "harga dikunci seumur akun", "Platform #1", "Trusted by X+ bisnis", angka spesifik tanpa bukti

**Billing model:**
- 1 kredit = 1 pengingat WhatsApp terkirim
- **Subscription Rp 249.000/bulan (Early Access 50% off, harga normal Rp 499.000) — WAJIB untuk akses platform & beli top-up:** include **300 kredit/bulan** — ⚠️ TIDAK rollover ke bulan berikutnya
- **Free Trial 14 hari** — saat user pertama selesai onboarding, `trialStartedAt = now`. Trial berakhir saat **14 hari habis ATAU welcome bonus 100 kredit habis (mana duluan)**. Setelah trial: dashboard tetap accessible tapi popup paksa subscribe + automation off + tombol top-up disabled
- **Welcome bonus 100 kredit** — langsung masuk `topupCreditsLeft` saat join (1x saja). Karena topup permanent (tidak ada expiry), kalau trial habis tanpa subscribe, 100 kredit tetap tersimpan dan otomatis aktif kembali saat user subscribe nanti
- **Top-up packages (pay-as-you-go, ✅ tidak ada expiry, hanya bisa beli kalau subscribed):** flat tier pricing — semakin besar paket, semakin murah per kredit
  - 200 kredit — Rp 399.000 (Rp 1.995/kredit)
  - 500 kredit — Rp 749.000 (Rp 1.498/kredit) · Terlaris · Hemat 25%
  - 1.000 kredit — Rp 1.299.000 (Rp 1.299/kredit) · Hemat 35%
- **Urutan pakai:** kredit subscription habis duluan → baru kredit top-up (welcome bonus + paket top-up)
- `remLeft` = `subCreditsLeft + topupCreditsLeft` (total usable, selalu computed)
- Credit states (total): Healthy (≥30), Low (10–29), Critical (1–9), Empty (0)
- Notif billing dikirim ke WA pemilik (`ownerWa`) — bukan ke email admin

**User states:**
- **Trial aktif:** `plan: "trial"` + `now < trialEndsAt` + `topupCreditsLeft > 0` — bisa pakai semua fitur
- **Trial expired:** `plan: "trial"` + (`now > trialEndsAt` ATAU `topupCreditsLeft === 0`) — **HARD LOCK**: full overlay di semua sidebar pages (kecuali billing), semua action button disabled. Satu-satunya escape = subscribe. Welcome bonus tetap tersimpan (permanent).
- **Subscriber aktif:** `plan: "subscriber"` — full access, bisa beli top-up

**Auth:** Google OAuth only. Tidak ada email/password login. `adminEmail` read-only dari Google account.

**Bahasa:** UI dalam Bahasa Indonesia. Code comments dan nama variabel dalam English.

**Target user:** Pemilik bisnis dan staff non-teknikal. UI harus simpel, jelas, tanpa jargon.

---

## DESIGN SYSTEM

**Selalu load `getstarvio-design-system.md` sebelum nulis CSS atau HTML apapun.**

Key rules yang tidak boleh dilanggar:
- Sidebar background = `var(--bg2)` — LIGHT, tidak pernah dark
- Active nav item = `background:var(--lime); color:var(--lime-dk)`
- Topbar height = 60px
- Content max-width = 960px centered (`max-width:960px;margin:0 auto`)
- Angka/stats/nomor WA = `font-family:'JetBrains Mono',monospace`
- Semua warna melalui CSS variables — tidak pernah hardcode hex
- Border radius hanya: `var(--r)` 12px, `var(--r-sm)` 8px, `var(--r-lg)` 16px, atau 20px untuk pill badges
- Teks lime di atas background lime selalu = `var(--lime-dk)`

---

## DATA SCHEMA — localStorage key: `getstarvio_user`

```js
{
  bizName: "string",
  bizType: "string",           // "salon" | "spa" | "klinik" | "barbershop" | "nail studio" | "lainnya"
  bizSlug: "string",           // digunakan untuk URL QR check-in
  bizLogo: "string | null",    // base64 data URL dari logo upload (max 200KB, resized to 120x120 via canvas saat upload). null = belum upload, fallback ke initial circle. Dipakai di check-in page header + QR print layout. Field opsional, di-set dari Settings page.
  setupComplete: boolean,      // true setelah 3-step setup checklist di dashboard semua selesai (logo + 1 customer + automation on). Set permanent — checklist card tidak muncul lagi setelah true. Default false saat onboarding.
  avgServiceValue: number,     // rata-rata harga layanan dalam IDR (default 150000). Dipakai di ROI calculation di dashboard. Editable di Settings → Profil Bisnis.
  adminName: "string",
  adminEmail: "string",        // read-only, dari Google OAuth
  ownerWa: "string",           // WA pemilik untuk notif billing (bisa beda dari waNum)
  waNum: "string",             // nomor WA yang digunakan untuk kirim reminder
  timezone: "string",
  country: "string",
  plan: "trial" | "subscriber", // status subscription. "trial" = belum pernah subscribe (punya welcome bonus). "subscriber" = bayar bulanan.
  subCreditsLeft: number,      // sisa kredit dari subscription bulan ini (reset bulanan, tidak rollover)
  subCreditsMax: number,       // cap kredit bulanan subscription (default 300 untuk subscriber, 0 untuk trial). Dipakai untuk progress bar "X dari Y kredit bulanan" di billing.
  topupCreditsLeft: number,    // kredit top-up (tidak ada expiry) — termasuk welcome bonus 100 kredit
  subRenewsAt: "ISO string | null", // tanggal renewal berikutnya (null untuk trial)
  trialStartedAt: "ISO string | null", // kapan trial dimulai (set otomatis saat user pertama selesai onboarding)
  trialEndsAt: "ISO string | null",    // kapan trial selesai (snapshot saat onboarding = startedAt + planConfig.trialDays). Re-compute kalau planConfig.trialDays berubah utk existing trial users.
  trialUsed: boolean,                  // true setelah trial selesai (expired ATAU subscribe). Pencegah double-claim welcome bonus.
  // remLeft = subCreditsLeft + topupCreditsLeft — SELALU computed, tidak disimpan langsung
  // trialDaysLeft = computed di loadU dari trialEndsAt
  // trialExpired = computed di loadU: plan === "trial" && (now > trialEndsAt || topupCreditsLeft === 0)
  remMax: number,              // legacy alias = subCreditsMax untuk subscriber; tidak relevan untuk trial (trial pakai topupCreditsLeft). Pertahankan untuk backward compat.
  automationEnabled: boolean,  // global master toggle untuk kirim pengingat otomatis. Default true setelah setup selesai. Di-set dari Automation page master card. Jika false: tidak ada pengingat di-schedule (tapi kategori individual setting tetap dihormati saat true).
  defaultInterval: number,     // default interval reminder dalam hari
  cats: [
    {
      id: "string",
      name: "string",          // contoh: "Keriting", "Hair Color", "Facial"
      icon: "string",          // emoji, dipilih dari daftar pre-made
      interval: number,        // hari antar kunjungan untuk layanan ini
      timing: "string",        // waktu perawatan lanjutan untuk template {{5}} (format: "4-6 minggu", "3 bulan", "1 tahun"). Editable di Kategori page. Default derive dari interval (e.g. 30 hari → "4-6 minggu").
      templateId: "string",    // ID template WA pre-made yang dipilih (aftercare_followup_1 sampai _5)
      templateBody: "string"   // copy template (read-only preview, rendered dengan {{1}}-{{5}} di UI)
    }
  ],
  customers: [
    {
      id: "string",
      name: "string",
      wa: "string",            // nomor WA dengan kode negara (628xxx)
      via: "string",           // "manual" | "qr"
      services: [
        {
          name: "string",      // harus match dengan cat.name
          icon: "string",      // dari cat
          date: "ISO string",  // tanggal kunjungan terakhir untuk layanan ini
          days: number         // interval untuk layanan ini (dari cat.interval)
        }
      ]
    }
  ],
  reminders: [
    {
      id: "string",
      cxId: "string",
      cxName: "string",
      svc: "string",           // nama layanan
      scheduledAt: "ISO string",
      sentAt: "ISO string | null",
      status: "terkirim" | "gagal" | "pending",
      kredit: number           // selalu 1
    }
  ],
  planConfig: {                // opsional — di-set dari admin page, dibaca oleh billing page
    freeBonus: number,         // welcome bonus credits (default 100)
    trialDays: number,         // trial period dalam hari (default 14)
    subCredits: number,        // subscription credits/bulan (default 300)
    subPrice: number,          // subscription price/bulan early access (default 249000)
    subPriceNormal: number,    // subscription price/bulan normal/coret (default 499000)
    tiers: [                   // 3 top-up package tiers (flat pricing, no bonus calculation)
      { price: number, credits: number, label?: string }
      // defaults:
      // { price: 399000,  credits: 200  }
      // { price: 749000,  credits: 500,  label: "Terlaris" }
      // { price: 1299000, credits: 1000, label: "Hemat 35%" }
    ]
  }
}
```

**Customer status logic — compute saat render, jangan disimpan:**
```js
function getStatus(service) {
  const diff = Math.floor((Date.now() - new Date(service.date)) / 86400000);
  const pct  = (diff / service.days) * 100;
  if (pct >= 100) return 'hilang';
  if (pct >= 70)  return 'mendekati';
  return 'aktif';
}

function worstStatus(customer) {
  const order = { hilang: 0, mendekati: 1, aktif: 2 };
  return customer.services.reduce((worst, svc) => {
    const s = getStatus(svc);
    return order[s] < order[worst] ? s : worst;
  }, 'aktif');
}
```

---

## PAGE DIRECTORY

| File | Title | Nav Label | Nav Pattern |
|---|---|---|---|
| `getstarvio-login.html` | Login | — | No nav |
| `getstarvio-onboarding.html` | Setup Awal | — | No nav |
| `getstarvio-dashboard.html` | Dashboard | 🏠 Dashboard | Sidebar |
| `getstarvio-catat-kunjungan.html` | Catat Kunjungan | 📋 Catat Kunjungan | Sidebar |
| `getstarvio-pelanggan.html` | Pelanggan | 👥 Pelanggan | Sidebar |
| `getstarvio-automation.html` | Automation | 🤖 Automation | Sidebar |
| `getstarvio-log-reminder.html` | Log Reminder | 📜 Log Reminder | Sidebar |
| `getstarvio-kategori.html` | Kategori Layanan | 🏷️ Kategori | Sidebar |
| `getstarvio-billing.html` | Billing & Kredit | 💳 Billing | Sidebar |
| `getstarvio-settings.html` | Settings | ⚙️ Settings | Sidebar |
| `getstarvio-checkin.html` | QR Check-in | — | Topbar only (public-facing) |
| `getstarvio-seed-data.html` | Seed Data | — | No nav (dev tool) |
| `getstarvio-admin.html` | Command Center | — | **INTERNAL ONLY** — tidak ada di sidebar user |

**Sidebar nav order** (exact, setiap sidebar page):
Dashboard → Catat Kunjungan → Pelanggan → Automation → Log Reminder → Kategori → Billing → Settings

> ⚠️ `getstarvio-admin.html` TIDAK ada di sidebar user. Ini tool internal tim getstarvio saja.

---

## INTER-PAGE CONNECTIONS

Setiap page harus link ke halaman lain dengan benar. Tidak ada broken `href`.

| From | Action | Goes to |
|---|---|---|
| Login | Setelah auth | Onboarding (baru) atau Dashboard (returning) |
| Onboarding Step 4 | CTA "Mulai pakai getstarvio" | Dashboard |
| Dashboard | "Lihat semua" (pelanggan) | Pelanggan |
| Dashboard | "Lihat log" | Log Reminder |
| Dashboard | Quick Link: Catat Kunjungan | Catat Kunjungan |
| Dashboard | Quick Link: Tambah Pelanggan | Pelanggan (add modal terbuka) |
| Dashboard | Quick Link: Atur Automation | Automation |
| Catat Kunjungan | "Tambah pelanggan baru" | tetap di halaman (modal flow) |
| Pelanggan | Row "Lihat" | buka detail panel/modal di halaman yang sama |
| Automation | "Top Up Kredit" | Billing |
| Kategori | tiap kategori | buka edit modal di halaman yang sama |
| Billing | Notification WA | tampilkan `ownerWa` (read-only) |
| Admin (internal) | Tambah Kredit / Suspend | update ADMIN_DATA di halaman yang sama |

---

## GLOBAL PHONE NUMBER RULES

Berlaku untuk **setiap input nomor HP di semua halaman** — onboarding, catat-kunjungan, pelanggan, checkin, billing, admin.

**Auto-strip leading zero:**
Saat user ketik angka diawali `0` (contoh `081234567890`), otomatis hapus `0` di depannya secara real-time pada event `input` — bukan saat blur, bukan saat submit.

**Implementasi (attach ke setiap WA input field):**
```js
function normalizePhone(raw, countryCode = '62') {
  let p = raw.replace(/\D/g, '')
  if (p.startsWith('0')) p = countryCode + p.slice(1)  // 0812 → 62812
  else if (!p.startsWith(countryCode)) p = countryCode + p
  return p
}

phoneInput.addEventListener('input', function () {
  const raw = this.value.replace(/\D/g, '')
  if (raw.startsWith('0')) {
    this.value = raw.slice(1)  // strip 0 — kode negara ada di selector terpisah
  }
})
```

**Format penyimpanan:** Selalu simpan dengan kode negara lengkap, tanpa `+`, tanpa spasi: `628123456789`

**Format tampilan:** Tampilkan di field input tanpa prefix kode negara (kode negara ada di dropdown selector terpisah). Contoh: user lihat `81234567890` di field, `+62` di selector.

**Country code selector:** Default selalu `🇮🇩 +62`. Opsi: +62 (ID), +60 (MY), +65 (SG), +63 (PH), +66 (TH), +84 (VN), +44 (GB), +1 (US).

**Validasi:** Minimum 9 digit setelah kode negara di-strip. Tampilkan inline error jika kurang.

---

## MUST-NOT DO LIST

1. **Jangan ubah desain sidebar.** Sidebar LIGHT (white bg, border-right). Dark sidebar = salah total.
2. **Jangan buat halaman baru** yang tidak ada di page directory. Tidak ada `settings.html`, tidak ada `profile.html`.
3. **Jangan ciptakan nav pattern baru.** Semua sidebar page pakai sidebar HTML block yang sama persis.
4. **Jangan tambah flow yang tidak ada di spec.** Onboarding 4 step = build 4 step persis.
5. **Jangan pakai `cx.date` atau `cx.days` flat di customer object.** Services ada di array `customer.services[]`. Selalu iterasi array-nya.
6. **Jangan taruh jenis bisnis (Salon, Spa, dll.) di free-text input.** Selalu dropdown/select.
7. **Jangan izinkan input icon manual.** Icon selalu dipilih dari emoji dropdown pre-made.
8. **Jangan buat template WA bisa diedit.** Template pre-made dan read-only — admin hanya bisa SELECT, tidak bisa edit teks.
9. **Jangan hardcode demo data sebagai sumber data.** Selalu baca dari `localStorage.getItem('getstarvio_user')`. Jika null, tampilkan empty states atau redirect ke onboarding.
10. **Jangan campur navigation pattern.** Sidebar pages pakai sidebar. Checkin pakai topbar-only. Login/Onboarding tidak ada nav.
11. **Jangan taruh Command Center di sidebar user.** `getstarvio-admin.html` adalah tool internal getstarvio — tidak pernah dilink dari app user.
12. **Jangan simpan nomor HP dengan leading `0`.** Selalu normalize sebelum save: `081234` → `6281234`. Selalu apply `normalizePhone()` di setiap WA input field pada event `input`.

---

## SHARED JS FUNCTIONS — wajib ada di semua halaman

Nama fungsi harus sama persis di setiap halaman:

```js
// Load getstarvio_user dari localStorage. Return null jika tidak ada.
// Auto-migrate dari DATA_VERSION 4 → 5 supaya existing user tidak kehilangan data.
function loadU() {
  try {
    const raw = localStorage.getItem('getstarvio_user')
    if (!raw) return null
    const u = JSON.parse(raw)

    // ── Migration v4 → v5 ──
    if (u.DATA_VERSION === 4) {
      // plan: "free" → "trial"
      if (u.plan === 'free') u.plan = 'trial'
      // trialStartedAt: kalau belum ada, set sekarang (kindest migration)
      if (!u.trialStartedAt) {
        u.trialStartedAt = u.plan === 'subscriber' ? null : new Date().toISOString()
      }
      // trialEndsAt: snapshot dari startedAt + planConfig.trialDays
      if (u.plan === 'trial' && u.trialStartedAt && !u.trialEndsAt) {
        const trialDays = (u.planConfig && u.planConfig.trialDays) || 14
        u.trialEndsAt = new Date(new Date(u.trialStartedAt).getTime() + trialDays * 86400000).toISOString()
      }
      // trialUsed: subscriber sudah pernah pakai trial; trial active belum
      if (typeof u.trialUsed === 'undefined') u.trialUsed = u.plan === 'subscriber'
      u.DATA_VERSION = 5
      localStorage.setItem('getstarvio_user', JSON.stringify(u))
    }

    if (u.DATA_VERSION !== 5) return null

    // ── Computed fields (tidak disimpan) ──
    u.remLeft = (u.subCreditsLeft || 0) + (u.topupCreditsLeft || 0)
    if (u.plan === 'trial' && u.trialEndsAt) {
      const endMs = new Date(u.trialEndsAt).getTime()
      u.trialDaysLeft = Math.max(0, Math.ceil((endMs - Date.now()) / 86400000))
      u.trialExpired = Date.now() > endMs || u.remLeft <= 0
    } else {
      u.trialDaysLeft = null
      u.trialExpired = false
    }
    return u
  } catch(e) { return null }
}

// Save user — hapus computed fields dulu sebelum simpan
function saveU(u) {
  delete u.remLeft
  delete u.trialDaysLeft
  delete u.trialExpired
  localStorage.setItem('getstarvio_user', JSON.stringify(u))
}

// Trial lock check — panggil di setiap sidebar page setelah loadU().
// Kalau trial expired & bukan di billing page, show full overlay (HARD LOCK).
function checkTrialLock() {
  const u = loadU()
  if (!u || !u.trialExpired) return
  if (location.pathname.includes('billing')) return  // billing page = exempt
  showTrialLockOverlay()
}

// Init sidebar: set active state + inject biz name.
function bootSidebar() {
  const page = location.pathname.split('/').pop()
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('href') === page)
  })
  const u = loadU()
  const el = document.getElementById('sidebarBizName')
  if (el && u) el.textContent = u.bizName || ''
}

// Redirect ke seed page untuk reset data.
function resetDemo() {
  location.href = 'getstarvio-seed-data.html?auto=1'
}

// Logout: clear localStorage + redirect ke login.
function doLogout() {
  localStorage.removeItem('getstarvio_user')
  location.href = 'getstarvio-login.html'
}
```

**Init order wajib setiap halaman:** `loadU()` → render/boot functions → `bootSidebar()` → `checkTrialLock()` (kecuali billing/login/onboarding/checkin/seed-data pages)

---

## TRIAL LOCK MATRIX — Canonical per-page behavior

> **Source of truth** untuk semua implementasi. Kalau page behavior berbeda dari tabel ini = bug.

| Page | Mode | Behavior saat trial expired | Implementation |
|---|---|---|---|
| **Dashboard** | **SOFT** | Banner merah atas + Quick Links 2/3 disabled (Catat Kunjungan tetap aktif); ROI/metrics tetap terlihat | `applySoftLock()` called from `render()` — no hard overlay |
| **Catat Kunjungan** | **NONE** | Full access (kasir harus bisa catat data bahkan saat trial expired — data ownership priority) | `function checkTrialLock() {}` — stub no-op |
| **Pelanggan** | **SOFT** | Banner atas + disable Import/Edit/Tambah buttons; Export tetap aktif via `data-always` (data ownership) | `trial-soft-locked` body class + `data-always` exception |
| **Automation** | **HARD** | Full overlay, semua action blocked; satu-satunya escape = subscribe | `showTrialLockOverlay()` via `checkTrialLock()` |
| **Log Pengingat** | **SOFT** | Banner atas + retry button disabled dengan tooltip "Subscribe untuk kirim ulang"; Export tetap aktif | `trial-soft-locked` + disable retry-btn |
| **Kategori** | **NONE** | Full access (setup kategori ga butuh kredit; owner harus bisa atur sebelum subscribe) | `function checkTrialLock() {}` — stub no-op |
| **Settings** | **NONE** | Full access (owner harus bisa upload logo, print QR, export data bahkan saat trial expired) | `function checkTrialLock() {}` — stub no-op |
| **Billing** | **SKIP** | Page ini adalah destination — tidak di-lock | `checkTrialLock()` tidak dipanggil sama sekali |
| **Check-in** | **SKIP** | Public-facing page (pelanggan-facing); tidak punya konsep trial | No call |
| **Login** | **SKIP** | User belum login, belum ada trial state | No call |
| **Onboarding** | **SKIP** | User baru sign-up, trial baru mulai | No call |
| **Seed Data** | **SKIP** | Dev tool — bukan user-facing | No call |
| **Admin** | **SKIP** | Internal tool getstarvio — separate auth | No call |

**Philosophy:**
- **HARD LOCK** = core paid feature (Automation). No workaround.
- **SOFT LOCK** = action pages where data/action matters but paying unlocks it (Dashboard, Pelanggan, Log). Data tetap visible, action di-gate.
- **NONE** = setup/data-ownership pages. Owner perlu akses bahkan saat trial expired untuk: catat kunjungan (Catat Kunjungan), setup jangan hilang (Kategori, Settings).
- **SKIP** = page ga butuh lock logic sama sekali.

**Exception buttons (`data-always`):**
Di soft-lock pages, button yang harus tetap aktif bahkan saat trial expired:
- Pelanggan: Export CSV (data ownership)
- Log Pengingat: Export CSV (data ownership)
- Dashboard: Catat Kunjungan link (kasir-path)

---

## TRIAL LOCK OVERLAY (snippet wajib di semua sidebar pages)

Tambahkan ke setiap sidebar page (kecuali billing — yang exempted dari lock):

**HTML (taruh di akhir body, sebelum script):**
```html
<div class="trial-lock-overlay" id="trialLockOverlay" style="display:none">
  <div class="tlo-card">
    <div class="tlo-icon">🔒</div>
    <div class="tlo-title">Trial selesai</div>
    <div class="tlo-sub">Subscribe untuk lanjut menggunakan getstarvio. Welcome bonus kredit kamu masih tersimpan dan otomatis aktif kembali setelah subscribe.</div>
    <div class="tlo-pricing">
      <span style="text-decoration:line-through;opacity:.5">Rp 499.000</span>
      <strong>Rp 249.000/bulan</strong>
      <span class="tlo-tag">Early Access 50% off</span>
    </div>
    <a href="getstarvio-billing.html" class="tlo-cta">Subscribe Sekarang →</a>
    <a href="getstarvio-billing.html" class="tlo-skip">Lihat detail di Billing</a>
  </div>
</div>
```

**CSS (tambahkan ke `<style>` setiap sidebar page):**
```css
.trial-lock-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:20px;animation:fadeUp .3s ease}
.trial-lock-overlay.show{display:flex}
.tlo-card{background:var(--bg2);border-radius:var(--r-lg);padding:36px 32px;text-align:center;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.4)}
.tlo-icon{font-size:48px;margin-bottom:14px}
.tlo-title{font-size:22px;font-weight:700;color:var(--ink);margin-bottom:8px}
.tlo-sub{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:20px}
.tlo-pricing{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;background:var(--lime-bg);border:1px solid var(--lime-bd);border-radius:var(--r-sm);padding:12px 16px;margin-bottom:20px;font-size:14px;color:var(--lime-dk)}
.tlo-pricing strong{font-size:18px;font-weight:700}
.tlo-tag{font-size:10px;font-weight:700;background:var(--lime);color:var(--lime-dk);padding:2px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:.04em}
.tlo-cta{display:block;width:100%;padding:14px;background:var(--lime);color:var(--lime-dk);border-radius:var(--r-sm);font-size:14px;font-weight:700;text-decoration:none;margin-bottom:10px;transition:all .15s;box-shadow:0 4px 16px rgba(184,240,74,.3)}
.tlo-cta:hover{background:var(--lime2);box-shadow:0 6px 20px rgba(184,240,74,.4)}
.tlo-skip{display:inline-block;font-size:11px;color:var(--ink3);text-decoration:underline}
```

**JS (tambahkan ke shared functions block):**
```js
function showTrialLockOverlay() {
  const el = document.getElementById('trialLockOverlay')
  if (el) el.classList.add('show')
}
```

**Behavior:** Overlay full-screen + dim backdrop. Tidak ada cara close kecuali navigasi ke billing.html. Tombol subtle "Lihat detail di Billing" jadi escape softer (masih ke billing page).

---

## DATA_VERSION

Setiap kali schema data berubah, increment `DATA_VERSION`. Ini memaksa reset localStorage lama otomatis (atau auto-migrate kalau migration logic ada di `loadU()`).
Versi saat ini: **5**. Selalu include di DUMMY object seed data. `loadU()` auto-migrate dari v4 → v5 supaya existing user tidak kehilangan data.

---

## SIDEBAR NAV IDs (canonical)

Setiap `<a>` nav item harus punya `id` yang sama persis di semua halaman:

```html
<a id="nav-dashboard"  href="getstarvio-dashboard.html"    class="nav-item"><span class="nav-icon">🏠</span>Dashboard</a>
<a id="nav-catat"      href="getstarvio-catat-kunjungan.html"    class="nav-item"><span class="nav-icon">📋</span>Catat Kunjungan</a>
<a id="nav-pelanggan"  href="getstarvio-pelanggan.html"    class="nav-item"><span class="nav-icon">👥</span>Pelanggan</a>
<a id="nav-automation" href="getstarvio-automation.html"   class="nav-item"><span class="nav-icon">🤖</span>Automation</a>
<a id="nav-log"        href="getstarvio-log-reminder.html" class="nav-item"><span class="nav-icon">📜</span>Log Reminder</a>
<a id="nav-kategori"   href="getstarvio-kategori.html"     class="nav-item"><span class="nav-icon">🏷️</span>Kategori</a>
<a id="nav-billing"    href="getstarvio-billing.html"      class="nav-item"><span class="nav-icon">💳</span>Billing</a>
<a id="nav-settings"   href="getstarvio-settings.html"     class="nav-item"><span class="nav-icon">⚙️</span>Settings</a>
```

---

## MOBILE RESPONSIVE — wajib semua halaman

**V3 adalah mobile-first.** Design untuk layar kecil dulu, scale ke desktop.

**Breakpoints:**
```css
/* Mobile  */ @media (max-width: 767px)  { ... }
/* Tablet  */ @media (768px–1023px)      { ... }
/* Desktop */ @media (min-width: 1024px) { ... }
```

**Sidebar di mobile — Hamburger Pattern:**
- Desktop (≥1024px): sidebar full 224px, selalu visible
- Tablet (768–1023px): sidebar collapsed — icon only, 60px wide
- Mobile (<768px): sidebar hidden. Hamburger button (☰) di topbar kiri → slide-in drawer dari kiri, overlay gelap di belakang, tap overlay untuk tutup
- Sidebar drawer mobile: full height, 260px wide, z-index di atas konten

```css
/* Contoh struktur hamburger mobile */
.hamburger-btn { display:none; } /* hidden di desktop */
@media (max-width: 767px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.25s; position:fixed; z-index:200; }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:199; }
  .sidebar-overlay.open { display:block; }
  .hamburger-btn { display:flex; }
  .main { width:100%; }
}
```

**Touch targets:** Minimum 44px height untuk semua tombol dan nav item

**Font sizes:** Minimum 13px — jangan ada teks lebih kecil di mobile

**Padding konten:** 16px di mobile, 28px di desktop

**Modal:** Full-screen di mobile (<768px), centered max-width 480px di desktop

**Tabel/grid:** Stack jadi list cards di mobile jika kolom >3

---

## VERSION REFERENCE STRATEGY

V3 rebuild dari scratch tapi referensi konten/flow dari versi yang paling baik per halaman:

| Halaman | Reference | Alasan |
|---|---|---|
| `getstarvio-login.html` | **v2.1** | Login v2.1 lebih polish (216→554 baris) |
| `getstarvio-onboarding.html` | **v3** ⚠️ FLOW LOCKED (4 steps) | v2.0 had 5 steps, v3 merged to 4 steps |
| `getstarvio-dashboard.html` | **v2.0** | v2.1 dipotong 42% — banyak fitur hilang |
| `getstarvio-catat-kunjungan.html` | **v2.0** | Halaman utama Catat Kunjungan (3-step modal) |
| `getstarvio-pelanggan.html` | **v2.0** | v2.1 dipotong 39% |
| `getstarvio-automation.html` | **v2.0** | Lebih lengkap |
| `getstarvio-log-reminder.html` | **v2.0** | Lebih lengkap |
| `getstarvio-kategori.html` | **v2.1** | v2.1 lebih baik di sini |
| `getstarvio-billing.html` | **v2.0** | v2.1 dipotong 53% — jauh lebih buruk |
| `getstarvio-checkin.html` | **v2.1** | Hanya ada di v2.1 |
| `getstarvio-settings.html` | **v3** | Sudah dibangun. Includes QR check-in (dari old Kumpulkan) |
| `getstarvio-admin.html` | **v2.0** `getstarvio-command-center.html` | v2.0 lebih lengkap (972 baris) |

**Cara pakai reference:** Baca file reference untuk memahami fitur yang perlu ada, tapi **jangan copy CSS-nya**. Rebuild UI dari design system v3. Yang diambil: logic JS, data flow, dan daftar fitur.

---

## HOW TO BUILD

Build satu halaman per sesi. Untuk setiap halaman:
1. Baca file reference (lihat Version Reference Strategy di atas)
2. Mulai dengan HTML shell dari design system (sidebar + hamburger + topbar + content)
3. Tambah CSS dari design system — jangan CSS baru sebelum base sudah masuk
4. Tambah CSS mobile responsive (hamburger, breakpoints)
5. Build HTML structure
6. Tambah JS: `loadU()` → render functions → `bootSidebar()`
7. Test dengan seed data dari `getstarvio-seed-data.html`

**Penamaan file:** Exact filename seperti di Page Directory. Jangan rename.
**Fonts:** Selalu include Google Fonts import. Jangan embed atau dihilangkan.
**Prototype behavior:** Untuk aksi yang butuh real API (WA send, payment, Google OAuth), simulasikan dengan setTimeout + visual feedback. Jangan ada tombol yang broken.
**Edit incremental:** Pakai `str_replace` untuk perubahan kecil. Rebuild dari scratch hanya jika ada structural error besar.
**Bahasa:** UI copy dalam Bahasa Indonesia informal. Code comments & variable names dalam English.

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | Sync with built HTML: `getstarvio-catat-kunjungan.html` is "Catat Kunjungan" page (halaman utama, bukan redirect). Nav ID = `nav-catat` pointing to `getstarvio-catat-kunjungan.html`. Onboarding = 4 steps (not 5). Settings includes QR check-in section. loadU() computes remLeft = subCreditsLeft + topupCreditsLeft. |
| 2026-03-26 | Sync: subCreditsMax=375 (was 300), content max-width=960px (was 900px), subscription=375 kredit/bulan (250 base + 125 early access +50%), top-up base Rp 1.000/kredit |
| 2026-03-27 | Subscription credits changed: 375 → 250 (flat, no early access bonus). subCreditsMax=250, remMax=250 for subscribers. Early access +50% bonus now applies ONLY to top-up packages. |
| 2026-03-27 | Added `planConfig` to data schema — optional field set by admin page, read by billing page for dynamic pricing. Log Reminder table mobile responsive (card layout <768px). |
| 2026-04-18 | **MAJOR PRICING UPDATE.** Subscription: Rp 249.000/bulan (Early Access 50% off, normal Rp 499.000) for 300 kredit/bulan (was 250). Top-up: flat tier pricing — 200/500/1.000 kredit @ Rp 399k/749k/1.299k (no more "+X% bonus" claim). Per-credit: Rp 1.995/1.498/1.299. Added `subPriceNormal` to planConfig. Removed `topupPrice` (basePrice concept). subCreditsMax=300. |
| 2026-04-18 | **POSITIONING & COPY UPDATE.** Broaden from "beauty/wellness" to "UMKM Indonesia" (salon, spa, klinik, barbershop, nail studio, bengkel, pet grooming, laundry, dll.). Add WhatsApp Coexistence Mode flow (Embedded Signup, scan QR di popup Meta). UI copy "reminder" → "pengingat". Trust commitments: garansi 30 hari uang kembali, no kartu kredit, bisa berhenti kapan saja. Banned claims: "diskon selamanya", "harga dikunci seumur akun", "Platform #1", "Trusted by X+ bisnis", angka spesifik tanpa bukti. |
| 2026-04-18 | **BILLING MODEL FINAL.** Subscription jadi **WAJIB** untuk akses platform & beli top-up (sebelumnya optional). Free Trial 14 hari (atau 100 kredit, mana duluan) saat user pertama selesai onboarding — `trialStartedAt` di-set otomatis. Welcome bonus 100 kredit langsung masuk `topupCreditsLeft` (permanent, tidak ada field terpisah). Setelah trial expired: dashboard tetap accessible tapi automation OFF + popup paksa subscribe + tombol top-up disabled. `planConfig.trialDays` editable dari admin (default 14). |
| 2026-04-18 | **DATA_VERSION 4 → 5 + UIUX HARD LOCK.** Schema rename `plan: "free"` → `"trial"`. Tambah `trialEndsAt` (snapshot, computed dari startedAt+trialDays saat onboarding) + `trialUsed` (boolean, true setelah expired/subscribe). loadU() auto-migrate v4→v5 supaya existing user tidak kehilangan data. Trial expired = **HARD LOCK overlay** di semua sidebar pages (kecuali billing) — tidak bisa skip, satu-satunya escape = subscribe. Subscribe modal tambah Bundle (subscribe + topup auto-checked, default 500 kredit) untuk conversion lift. Billing page restructured ke 4 conditional states (A=trial active, B=trial expired, C=subscriber, D=subscriber low). |
| 2026-04-18 | **CATAT KUNJUNGAN UIUX.** 3 step → 2 step (Save langsung ke Success Screen, hapus Konfirmasi terpisah). Tambah Recent Customers Row (8 pills horizontal, tap = skip search). Success screen dengan dual buttons "Catat Lagi"/"Selesai" (no auto-close). NO trial lock di halaman ini — `checkTrialLock()` di-stub jadi no-op (kasir harus selalu bisa catat data). |
| 2026-04-18 | **CHECK-IN BRANDING + bizLogo SCHEMA.** Tambah `bizLogo` field (base64 data URL, opsional, max 200KB resized 120x120). Check-in page rebrand: bizLogo/initial circle + bizName heading sebagai header (hapus topbar getstarvio), "Powered by getstarvio" pindah ke footer kecil. WA consent line wajib di State 2 & 3 ("Dengan check-in, kamu setuju menerima pengingat... dari [bizName]."). Hapus tombol "Scan lagi" di success — final state, sebut bizName di message + subtle "boleh tutup" hint. Error state friendly (no internal terms). Settings: tambah logo upload field di Section 2 Profil Bisnis (canvas resize, validate size+format+aspect). |
| 2026-04-18 | **DASHBOARD UIUX OVERHAUL.** Tambah `setupComplete` (boolean, auto-detect 3 steps) + `avgServiceValue` (number, default 150000, editable di Settings) ke schema. Dashboard: Setup Checklist card (logo upload inline / tambah pelanggan / aktifkan automation, auto-dismiss permanent setelah semua selesai). ROI Card baru (untuk user dengan reminder data — pelanggan kembali, response rate, estimasi revenue, ROI multiplier) ATAU Projection Card (untuk new users — proyeksi pengingat + revenue). Metrics Grid reframe: "Kembali via Pengingat" jadi metric utama. Tips Section bawah (Print QR + Salin Link). Section order baru. **Trial Behavior Hybrid:** Dashboard = soft lock (banner merah + Quick Links 2/3 disabled, Catat Kunjungan + Billing tetap aktif), sidebar pages lain tetap hard lock overlay. Konsisten dengan filosofi: dashboard punya value sebagai "preview" untuk push subscribe, action pages tetap forced. |
| 2026-04-18 | **SPEC CONSISTENCY PATCH (pre-build review).** (1) Added canonical **TRIAL LOCK MATRIX** (13 pages × mode HARD/SOFT/NONE/SKIP) — single source of truth, replaces scattered inline notes in page specs. (2) Added `subCreditsMax: number` field to DATA SCHEMA block (was used in seed + admin but missing from canonical schema). (3) Clarified `remMax` sebagai legacy alias dari subCreditsMax (backward compat), bukan field baru. (4) Cross-patched: `09-billing.md` plan references (7 lines `"free"` → `"trial"`), `11-seed-data.md` (DATA_VERSION 4→5 + 11 presets covering 5 trial + 6 subscriber states + v5 fields), `07-log-reminder.md` retry credit order (sub first per global rule, bukan top-up first), `12-admin.md` (duplicate status badge line removed, status enum canonicalized ke 5 nilai, ADMIN_DATA example extended dengan plan/trialEndsAt/subCreditsMax). |
| 2026-04-18 | **SPEC CONSISTENCY PATCH #2 (cross-page review).** (1) Added `automationEnabled: boolean` field to DATA SCHEMA — referenced di 06-automation.md + 03-dashboard.md setup checklist tapi belum ada di canonical schema. (2) Added `cats[].timing: string` field — dipakai untuk template variable `{{5}}` di 06-automation.md + 08-kategori.md. (3) Cross-patched: `05-pelanggan.md` added TRIAL BEHAVIOR SOFT LOCK section (data ownership: banner + disable Tambah/Edit/Import, Export via `data-always`), `09-billing.md` Section 3 `plan === 'free'` → `'trial'` + Known Bug #3 updated (subscription wajib untuk top-up), `07-log-reminder.md` retry credit order clarification in changelog (superseded 2026-03-27 entry). |
