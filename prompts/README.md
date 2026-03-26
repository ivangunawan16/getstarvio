# Starvio v3 — Prompt Files

## Cara Pakai

Setiap kali mau build atau update satu halaman di Claude Code:

1. **Paste `00-global.md`** — selalu pertama, berisi rules & schema yang berlaku semua page
2. **Paste file page yang mau dikerjakan** — contoh `04-catat-kunjungan.md`
3. **Tambah instruksi spesifik kamu** — contoh: "Build halaman ini" atau "Update bagian search pelanggan"

Tidak perlu paste file page lain yang tidak dikerjakan.

---

## Daftar File

| File | Halaman | Keterangan |
|---|---|---|
| `00-global.md` | — | Rules global, data schema, must-not-do list |
| `01-login.md` | `starvio-login.html` | Google OAuth, 2-kolom layout |
| `02-onboarding.md` | `starvio-onboarding.html` | 5 step: WA → Profil → QR → Kategori → Selesai |
| `03-dashboard.md` | `starvio-dashboard.html` | Greeting card, metrics, quick links |
| `04-catat-kunjungan.md` | `starvio-catat-kunjungan.html` | Catat kunjungan harian — search first, no CRM |
| `05-pelanggan.md` | `starvio-pelanggan.html` | Daftar pelanggan, filter, detail |
| `06-automation.md` | `starvio-automation.html` | Toggle, jadwal, template per kategori |
| `07-log-reminder.md` | `starvio-log-reminder.html` | Riwayat reminder, filter, retry |
| `08-kategori.md` | `starvio-kategori.html` | Kelola kategori layanan, ikon dropdown, template |
| `09-billing.md` | `starvio-billing.html` | Top up kredit, auto top up, riwayat |
| `10-checkin.md` | `starvio-checkin.html` | Halaman publik QR check-in pelanggan |
| `11-seed-data.md` | `starvio-seed-data.html` | Dev tool inject dummy data (Celestial Spa / Cynthia) |
| `12-admin.md` | `starvio-admin.html` | Internal dashboard tim Starvio (bukan untuk user) |
| `13-settings.md` | `starvio-settings.html` | Profil bisnis, WA reconnect, danger zone |

---

## Cara Tambah Feedback

Saat ada feedback baru untuk halaman tertentu, cukup:
1. Buka file page yang relevan (misal `04-catat-kunjungan.md`)
2. Tambah poin baru di section **Must-Have** atau **Changelog**
3. Lain kali rebuild halaman itu, feedback sudah ter-record

Tidak perlu ubah file lain.

---

## Design System

Selalu baca juga: `../starvio-design-system.md` sebelum nulis CSS apapun.
