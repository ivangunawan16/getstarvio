# getstarvio v3 — Prompt Files

Source of truth untuk semua halaman getstarvio. Tiap file `.md` = 1 page spec. HTML output ada di folder parent (`version 3.0/`).

---

## Cara Pakai (Update Halaman)

Tiap kali mau update 1 halaman:

1. **Paste `00-global.md`** — rules & schema yang berlaku semua page
2. **Paste file page yang mau dikerjakan** — contoh `04-catat-kunjungan.md`
3. **Sebelum nulis CSS, baca `getstarvio-design-system.md`** — untuk tokens, components, layout rules
4. **Tambah instruksi spesifik** — contoh: "Update bagian search pelanggan"

Tidak perlu paste file page lain yang tidak dikerjakan.

---

## Daftar File

| File | Halaman | Keterangan |
|---|---|---|
| `00-global.md` | — | Rules global, data schema v5, must-not-do list, trial lock behavior |
| `01-login.md` | `getstarvio-login.html` | Google OAuth, 2-kolom layout, trust badges |
| `02-onboarding.md` | `getstarvio-onboarding.html` | **4 step** (LOCKED): Connect WA → Profil Bisnis → Kategori → Selesai + QR |
| `03-dashboard.md` | `getstarvio-dashboard.html` | Setup checklist, metrics, ROI card, quick links, soft trial lock |
| `04-catat-kunjungan.md` | `getstarvio-catat-kunjungan.html` | 2-step flow, recent customers, NO trial lock |
| `05-pelanggan.md` | `getstarvio-pelanggan.html` | Daftar pelanggan + CSV import/export |
| `06-automation.md` | `getstarvio-automation.html` | Toggle, 5 aftercare templates Meta `{{1}}-{{5}}` |
| `07-log-reminder.md` | `getstarvio-log-reminder.html` | Riwayat reminder, search, bulk retry |
| `08-kategori.md` | `getstarvio-kategori.html` | Kelola kategori (drag/arrow reorder), interval auto-suggest |
| `09-billing.md` | `getstarvio-billing.html` | Subscription + top-up tiers, bundle subscribe |
| `10-checkin.md` | `getstarvio-checkin.html` | Halaman publik QR check-in, bizLogo branding |
| `11-seed-data.md` | `getstarvio-seed-data.html` | Dev tool inject dummy data |
| `12-admin.md` | `getstarvio-admin.html` | Internal dashboard tim getstarvio (bukan untuk user) |
| `13-settings.md` | `getstarvio-settings.html` | Profil, logo upload, QR print, danger zone |

**Reference doc:** `getstarvio-design-system.md` — CSS variables, typography, komponen (selalu baca sebelum nulis CSS).

---

## Cara Tambah Feedback

Saat ada feedback baru untuk halaman tertentu:

1. Buka file page yang relevan (misal `04-catat-kunjungan.md`)
2. Tambah poin baru di section **Must-Have** atau **Changelog**
3. Lain kali rebuild halaman itu, feedback sudah ter-record

Tidak perlu ubah file lain.

---

## Rebuild dari Scratch

Kalau perlu rebuild semua halaman dari nol (sesi baru Claude Code):

### Langkah 1 — Baca dulu (urutan penting)

1. `00-global.md` — prime directive, data schema, shared JS, phone rules, mobile pattern
2. `getstarvio-design-system.md` — complete CSS design system
3. `01-login.md` s/d `13-settings.md` — baca semua sebelum mulai build

### Langkah 2 — Build order (jangan loncat phase)

**Phase 1 — Foundation** (verifikasi sebelum lanjut)
1. `getstarvio-seed-data.html` — inject dummy data
2. `getstarvio-login.html` — entry point
3. `getstarvio-onboarding.html` — wajib selesai sebelum dashboard bisa test
4. `getstarvio-dashboard.html` — hub utama

**Phase 2 — Core Daily**
5. `getstarvio-catat-kunjungan.html`
6. `getstarvio-pelanggan.html`
7. `getstarvio-kategori.html`

**Phase 3 — Automation & Billing**
8. `getstarvio-automation.html`
9. `getstarvio-log-reminder.html`
10. `getstarvio-billing.html`

**Phase 4 — Additional**
11. `getstarvio-settings.html`
12. `getstarvio-checkin.html`

**Phase 5 — Internal**
13. `getstarvio-admin.html`

---

## Aturan Kritis (repeat dari 00-global.md)

1. **Sidebar LIGHT** — `var(--bg2)` / white. Bukan dark.
2. **Template WA = SELECT ONLY** — tidak bisa diedit teksnya. Format Meta Cloud API `{{1}}-{{5}}`.
3. **Icon emoji = dropdown pre-made** — bukan input manual.
4. **Nomor HP** — strip leading 0 real-time, simpan dengan country code (628xxx).
5. **Semua data dari localStorage `getstarvio_user`** — tidak ada hardcoded dummy di halaman production.
6. **`getstarvio-admin.html` tidak pernah dilink dari app user.**
7. **Onboarding = LOCKED 4 step** — Connect WA → Profil → Kategori → Selesai+QR. Jangan ubah.
8. **`DATA_VERSION: 5`** — harus match di seed data dan `loadU()`. Auto-migrate dari v4.
9. **Bahasa UI = Indonesia informal** — "Kamu", "Yuk", bukan "Anda".
10. **Prototype actions** (Google OAuth, WA send, payment) = simulate dengan setTimeout + visual feedback.
11. **Trust claims** — jangan klaim "Platform #1", "Trusted by X+", angka spesifik tanpa bukti, "diskon selamanya". Pakai: 14 hari trial · 100 kredit gratis · tanpa kartu kredit · garansi 30 hari.

---

## Cara Kerja Efisien

- **Satu halaman per sesi** — jangan coba build semua sekaligus
- **Perubahan kecil pakai `str_replace`/Edit** — jangan rebuild full file
- **Kalau ada keputusan desain yang ambigu** — tanya dulu, jangan asumsikan
