# Starvio v3 — GLOBAL RULES
**Paste file ini PERTAMA sebelum file page manapun.**

---

## PRIME DIRECTIVE

Kamu sedang membangun halaman untuk **Starvio** — WhatsApp-based customer return reminder SaaS untuk bisnis beauty/wellness Indonesia (salon, spa, klinik, barbershop, dll.).

**Tiga aturan yang override segalanya:**
1. **Lock design.** Setiap pixel ikuti `starvio-design-system.md`. Jangan ciptakan warna, font, spacing, atau komponen yang tidak ada di sana. Kalau tidak yakin, tanya — jangan tebak.
2. **Lock data schema.** Semua page baca dari dan tulis ke satu localStorage key: `starvio_user`. Schema ada di bawah. Jangan tambah key baru atau ubah nama field.
3. **Lock flow.** Flow per page didefinisikan di file masing-masing. Jangan tambah step, hapus step, atau ubah urutan tanpa diminta.

---

## PRODUCT CONTEXT

**Yang dilakukan Starvio:** Membantu bisnis beauty/wellness kecil melacak kapan tiap pelanggan terakhir kali datang untuk tiap layanan, lalu otomatis kirim reminder WhatsApp saat waktunya balik.

**Billing model:**
- 1 kredit = 1 WhatsApp reminder terkirim
- **Welcome bonus:** 100 kredit gratis saat pertama join (semua user, 1x saja)
- **Subscription Rp 250.000/bulan:** include 375 kredit/bulan (250 base + 125 early access +50%) — ⚠️ TIDAK rollover ke bulan berikutnya
- **Top-up (pay-as-you-go):** beli kredit extra kapan saja — ✅ tidak ada expiry
- **Urutan pakai:** kredit subscription habis duluan → baru kredit top-up
- `remLeft` = `subCreditsLeft + topupCreditsLeft` (total usable, selalu computed)
- Credit states (total): Healthy (≥30), Low (10–29), Critical (1–9), Empty (0)
- Notif billing dikirim ke WA pemilik (`ownerWa`) — bukan ke email admin

**Auth:** Google OAuth only. Tidak ada email/password login. `adminEmail` read-only dari Google account.

**Bahasa:** UI dalam Bahasa Indonesia. Code comments dan nama variabel dalam English.

**Target user:** Pemilik bisnis dan staff non-teknikal. UI harus simpel, jelas, tanpa jargon.

---

## DESIGN SYSTEM

**Selalu load `starvio-design-system.md` sebelum nulis CSS atau HTML apapun.**

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

## DATA SCHEMA — localStorage key: `starvio_user`

```js
{
  bizName: "string",
  bizType: "string",           // "salon" | "spa" | "klinik" | "barbershop" | "nail studio" | "lainnya"
  bizSlug: "string",           // digunakan untuk URL QR check-in
  adminName: "string",
  adminEmail: "string",        // read-only, dari Google OAuth
  ownerWa: "string",           // WA pemilik untuk notif billing (bisa beda dari waNum)
  waNum: "string",             // nomor WA yang digunakan untuk kirim reminder
  timezone: "string",
  country: "string",
  plan: "free" | "subscriber", // status subscription
  subCreditsLeft: number,      // sisa kredit dari subscription bulan ini (reset bulanan, tidak rollover)
  topupCreditsLeft: number,    // kredit top-up (tidak ada expiry)
  subRenewsAt: "ISO string | null", // tanggal renewal berikutnya (null jika free)
  // remLeft = subCreditsLeft + topupCreditsLeft — SELALU computed, tidak disimpan langsung
  remMax: number,              // max kredit per bulan (375 untuk subscriber incl. early access bonus, tidak relevan untuk free)
  defaultInterval: number,     // default interval reminder dalam hari
  cats: [
    {
      id: "string",
      name: "string",          // contoh: "Keriting", "Hair Color", "Facial"
      icon: "string",          // emoji, dipilih dari daftar pre-made
      interval: number,        // hari antar kunjungan untuk layanan ini
      templateId: "string",    // ID template WA pre-made yang dipilih
      templateBody: "string"   // copy template (read-only)
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
  ]
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
| `starvio-login.html` | Login | — | No nav |
| `starvio-onboarding.html` | Setup Awal | — | No nav |
| `starvio-dashboard.html` | Dashboard | 🏠 Dashboard | Sidebar |
| `starvio-catat-kunjungan.html` | Catat Kunjungan | 📋 Catat Kunjungan | Sidebar |
| `starvio-pelanggan.html` | Pelanggan | 👥 Pelanggan | Sidebar |
| `starvio-automation.html` | Automation | 🤖 Automation | Sidebar |
| `starvio-log-reminder.html` | Log Reminder | 📜 Log Reminder | Sidebar |
| `starvio-kategori.html` | Kategori Layanan | 🏷️ Kategori | Sidebar |
| `starvio-billing.html` | Billing & Kredit | 💳 Billing | Sidebar |
| `starvio-settings.html` | Settings | ⚙️ Settings | Sidebar |
| `starvio-checkin.html` | QR Check-in | — | Topbar only (public-facing) |
| `starvio-seed-data.html` | Seed Data | — | No nav (dev tool) |
| `starvio-admin.html` | Command Center | — | **INTERNAL ONLY** — tidak ada di sidebar user |

**Sidebar nav order** (exact, setiap sidebar page):
Dashboard → Catat Kunjungan → Pelanggan → Automation → Log Reminder → Kategori → Billing → Settings

> ⚠️ `starvio-admin.html` TIDAK ada di sidebar user. Ini tool internal tim Starvio saja.

---

## INTER-PAGE CONNECTIONS

Setiap page harus link ke halaman lain dengan benar. Tidak ada broken `href`.

| From | Action | Goes to |
|---|---|---|
| Login | Setelah auth | Onboarding (baru) atau Dashboard (returning) |
| Onboarding Step 4 | CTA "Mulai pakai Starvio" | Dashboard |
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
9. **Jangan hardcode demo data sebagai sumber data.** Selalu baca dari `localStorage.getItem('starvio_user')`. Jika null, tampilkan empty states atau redirect ke onboarding.
10. **Jangan campur navigation pattern.** Sidebar pages pakai sidebar. Checkin pakai topbar-only. Login/Onboarding tidak ada nav.
11. **Jangan taruh Command Center di sidebar user.** `starvio-admin.html` adalah tool internal Starvio — tidak pernah dilink dari app user.
12. **Jangan simpan nomor HP dengan leading `0`.** Selalu normalize sebelum save: `081234` → `6281234`. Selalu apply `normalizePhone()` di setiap WA input field pada event `input`.

---

## SHARED JS FUNCTIONS — wajib ada di semua halaman

Nama fungsi harus sama persis di setiap halaman:

```js
// Load starvio_user dari localStorage. Return null jika tidak ada atau schema lama.
function loadU() {
  try {
    const raw = localStorage.getItem('starvio_user')
    if (!raw) return null
    const u = JSON.parse(raw)
    if (u.DATA_VERSION !== 4) return null  // force reset jika schema lama
    // Selalu compute remLeft dari kedua jenis kredit
    u.remLeft = (u.subCreditsLeft || 0) + (u.topupCreditsLeft || 0)
    return u
  } catch(e) { return null }
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
  location.href = 'starvio-seed-data.html?auto=1'
}

// Logout: clear localStorage + redirect ke login.
function doLogout() {
  localStorage.removeItem('starvio_user')
  location.href = 'starvio-login.html'
}
```

**Init order wajib setiap halaman:** `loadU()` → render/boot functions → `bootSidebar()`

---

## DATA_VERSION

Setiap kali schema data berubah, increment `DATA_VERSION`. Ini memaksa reset localStorage lama otomatis.
Versi saat ini: **4**. Selalu include di DUMMY object seed data.

---

## SIDEBAR NAV IDs (canonical)

Setiap `<a>` nav item harus punya `id` yang sama persis di semua halaman:

```html
<a id="nav-dashboard"  href="starvio-dashboard.html"    class="nav-item"><span class="nav-icon">🏠</span>Dashboard</a>
<a id="nav-catat"      href="starvio-catat-kunjungan.html"    class="nav-item"><span class="nav-icon">📋</span>Catat Kunjungan</a>
<a id="nav-pelanggan"  href="starvio-pelanggan.html"    class="nav-item"><span class="nav-icon">👥</span>Pelanggan</a>
<a id="nav-automation" href="starvio-automation.html"   class="nav-item"><span class="nav-icon">🤖</span>Automation</a>
<a id="nav-log"        href="starvio-log-reminder.html" class="nav-item"><span class="nav-icon">📜</span>Log Reminder</a>
<a id="nav-kategori"   href="starvio-kategori.html"     class="nav-item"><span class="nav-icon">🏷️</span>Kategori</a>
<a id="nav-billing"    href="starvio-billing.html"      class="nav-item"><span class="nav-icon">💳</span>Billing</a>
<a id="nav-settings"   href="starvio-settings.html"     class="nav-item"><span class="nav-icon">⚙️</span>Settings</a>
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
| `starvio-login.html` | **v2.1** | Login v2.1 lebih polish (216→554 baris) |
| `starvio-onboarding.html` | **v3** ⚠️ FLOW LOCKED (4 steps) | v2.0 had 5 steps, v3 merged to 4 steps |
| `starvio-dashboard.html` | **v2.0** | v2.1 dipotong 42% — banyak fitur hilang |
| `starvio-catat-kunjungan.html` | **v2.0** | Halaman utama Catat Kunjungan (3-step modal) |
| `starvio-pelanggan.html` | **v2.0** | v2.1 dipotong 39% |
| `starvio-automation.html` | **v2.0** | Lebih lengkap |
| `starvio-log-reminder.html` | **v2.0** | Lebih lengkap |
| `starvio-kategori.html` | **v2.1** | v2.1 lebih baik di sini |
| `starvio-billing.html` | **v2.0** | v2.1 dipotong 53% — jauh lebih buruk |
| `starvio-checkin.html` | **v2.1** | Hanya ada di v2.1 |
| `starvio-settings.html` | **v3** | Sudah dibangun. Includes QR check-in (dari old Kumpulkan) |
| `starvio-admin.html` | **v2.0** `starvio-command-center.html` | v2.0 lebih lengkap (972 baris) |

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
7. Test dengan seed data dari `starvio-seed-data.html`

**Penamaan file:** Exact filename seperti di Page Directory. Jangan rename.
**Fonts:** Selalu include Google Fonts import. Jangan embed atau dihilangkan.
**Prototype behavior:** Untuk aksi yang butuh real API (WA send, payment, Google OAuth), simulasikan dengan setTimeout + visual feedback. Jangan ada tombol yang broken.
**Edit incremental:** Pakai `str_replace` untuk perubahan kecil. Rebuild dari scratch hanya jika ada structural error besar.
**Bahasa:** UI copy dalam Bahasa Indonesia informal. Code comments & variable names dalam English.

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | Sync with built HTML: `starvio-catat-kunjungan.html` is "Catat Kunjungan" page (halaman utama, bukan redirect). Nav ID = `nav-catat` pointing to `starvio-catat-kunjungan.html`. Onboarding = 4 steps (not 5). Settings includes QR check-in section. loadU() computes remLeft = subCreditsLeft + topupCreditsLeft. |
| 2026-03-26 | Sync: subCreditsMax=375 (was 300), content max-width=960px (was 900px), subscription=375 kredit/bulan (250 base + 125 early access +50%), top-up base Rp 1.000/kredit |
