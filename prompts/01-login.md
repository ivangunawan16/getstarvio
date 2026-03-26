# Page: LOGIN (`starvio-login.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Flow

Landing → klik "Lanjut dengan Google" → Google account picker modal muncul → pilih akun:
- Pilih **Cynthia** (existing user):
  - Cek `starvio_user` di localStorage, jika ada & `DATA_VERSION === 4` → redirect ke `starvio-dashboard.html`
  - Jika tidak ada → redirect ke `starvio-seed-data.html?auto=1&next=dashboard` (inject data dulu)
- Pilih **Buat Akun Baru**:
  - `localStorage.removeItem('starvio_user')` → redirect ke `starvio-onboarding.html`

Tidak ada link manual ke onboarding. Semua masuk lewat Google OAuth.

---

## Layout

Dua kolom:
- **Kiri:** Dark hero (`var(--ink)` background) — brand message, tagline, value proposition, social proof
- **Kanan:** Form putih — tombol Google login saja + tombol buat akun baru di bawahnya. **Tidak ada** tulisan "Daftar Gratis" di pojok kanan atas. Satu pintu masuk: Google.

---

## Must-Have

- Tombol "Lanjut dengan Google" — **satu-satunya** metode auth, tidak ada email/password, tidak ada registrasi terpisah
- Klik Google button → **Google Account Picker modal** muncul (overlay), berisi:
  1. **Cynthia** (existing demo user) — avatar + email, klik → cek localStorage → dashboard atau seed+dashboard
  2. **Buat Akun Baru** — klik → clear localStorage → onboarding
  3. Close button di modal
- **Tidak ada** tulisan "Daftar Gratis" di pojok kanan atas halaman
- Logika: kalau account sudah exist di localStorage = dashboard, kalau belum = onboarding
- Tidak ada link ke halaman onboarding dari manapun selain flow login ini

---

## Reference

- **Version acuan:** `version 2.1/starvio-login.html` — v2.1 punya login yang lebih clean (v2.0 ada email/password, v2.1 sudah pure Google OAuth)
- **Mobile layout:** single-column — sembunyikan hero kiri di layar kecil, hanya tampilkan form kanan
- **Demo mode:** tetap ada di v3 (2 opsi: Cynthia existing + Buat Akun Baru)

---

## Changelog
_Catat semua perubahan/feedback di sini dengan tanggal_

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.1, mobile single-column |
| 2026-03-26 | Update: hapus "Daftar Gratis", demo mode jadi 2 opsi (Cynthia existing + Buat Akun Baru), tidak ada link manual ke onboarding |
| 2026-03-26 | Update: Google button → account picker modal (bukan langsung redirect). Cynthia cek localStorage dulu. Buat Akun Baru di bawah Cynthia di picker. Tidak ada tulisan "Daftar Gratis" di pojok kanan |
| 2026-03-26 | Verified: HTML matches prompt spec. Google OAuth only, no registration link, account picker with 2 options. |
