# STARVIO V3 — KICKOFF PROMPT FOR CLAUDE CODE

> **Cara pakai:**
> Copy seluruh isi file ini → paste ke Claude Code sebagai pesan pertama di sesi baru.
> Claude Code akan membaca semua context dan tahu persis apa yang harus dikerjakan.

---

## TASK

Kamu akan membangun ulang **Starvio v3** dari scratch — multi-page HTML prototype yang terhubung via localStorage.

Sebelum nulis satu baris kode apapun, kamu WAJIB membaca semua file berikut secara berurutan. Ini bukan opsional.

---

## LANGKAH 1 — BACA SEMUA FILE INI DULU (URUTAN PENTING)

Jalankan command berikut untuk memastikan kamu menemukan semua file:

```bash
ls "version 3.0/prompts/"
```

Lalu baca file-file ini satu per satu secara berurutan:

### Global Rules (WAJIB DIBACA PERTAMA)
1. `version 3.0/prompts/00-global.md` — Prime directive, design system rules, data schema, shared JS functions, phone rules, mobile responsive pattern, version reference strategy
2. `starvio-design-system.md` — Complete CSS design system (variables, typography, components)

### Per-Page Specs (baca semua sebelum mulai build)
3. `version 3.0/prompts/01-login.md`
4. `version 3.0/prompts/02-onboarding.md`
5. `version 3.0/prompts/03-dashboard.md`
6. `version 3.0/prompts/04-catat-kunjungan.md`
7. `version 3.0/prompts/05-pelanggan.md`
8. `version 3.0/prompts/06-automation.md`
9. `version 3.0/prompts/07-log-reminder.md`
10. `version 3.0/prompts/08-kategori.md`
11. `version 3.0/prompts/09-billing.md`
12. `version 3.0/prompts/10-checkin.md`
13. `version 3.0/prompts/11-seed-data.md`
14. `version 3.0/prompts/12-admin.md`
15. `version 3.0/prompts/13-settings.md`

### Reference Files (baca untuk understand fitur yang perlu ada)
Tiap halaman punya "Reference" section di spec-nya yang menyebut file mana yang perlu dibaca. Baca file reference di folder:
- `version 2.0/` — untuk halaman yang referencenya v2.0
- `version 2.1/` — untuk halaman yang referencenya v2.1

> **Penting:** Dari reference file, yang diambil adalah **logic JS dan daftar fitur**, bukan CSS-nya. CSS selalu dari design system v3.

---

## LANGKAH 2 — PAHAMI STRUKTUR OUTPUT

Semua file HTML output disimpan di folder: `version 3.0/`

Nama file harus exact (lihat Page Directory di `00-global.md`):
```
starvio-login.html
starvio-onboarding.html
starvio-dashboard.html
starvio-catat-kunjungan.html
starvio-pelanggan.html
starvio-automation.html
starvio-log-reminder.html
starvio-kategori.html
starvio-billing.html
starvio-settings.html
starvio-checkin.html
starvio-seed-data.html
starvio-admin.html
```

---

## LANGKAH 3 — BUILD ORDER (PHASE PLAN)

Build dalam urutan ini. **Jangan loncat phase.** Tiap phase bergantung pada phase sebelumnya.

### Phase 1 — Foundation (build ini dulu, verifikasi sebelum lanjut)
| Order | File | Kenapa duluan |
|---|---|---|
| 1 | `starvio-seed-data.html` | Inject dummy data ke localStorage — dipakai untuk test semua halaman lain |
| 2 | `starvio-login.html` | Entry point — semua mulai dari sini |
| 3 | `starvio-onboarding.html` | Wajib selesai sebelum dashboard bisa test dengan data kosong |
| 4 | `starvio-dashboard.html` | Hub utama — verifikasi sidebar, nav, dan data flow benar |

**Checkpoint Phase 1:** Setelah selesai, buka `starvio-seed-data.html` → data masuk localStorage → buka `starvio-login.html` → flow ke dashboard → semua nav link di sidebar harus ada (walaupun halaman belum dibangun).

### Phase 2 — Core Daily Actions
| Order | File | Kenapa |
|---|---|---|
| 5 | `starvio-catat-kunjungan.html` | Aksi harian utama — catat kunjungan |
| 6 | `starvio-pelanggan.html` | Manajemen pelanggan — linked dari dashboard |
| 7 | `starvio-kategori.html` | Konfigurasi layanan — dibutuhkan oleh catat kunjungan dan pelanggan |

### Phase 3 — Automation & Billing
| Order | File |
|---|---|
| 8 | `starvio-automation.html` |
| 9 | `starvio-log-reminder.html` |
| 10 | `starvio-billing.html` |

### Phase 4 — Additional Pages
| Order | File |
|---|---|
| 11 | `starvio-settings.html` |
| 12 | `starvio-checkin.html` |

### Phase 5 — Internal Tool
| Order | File |
|---|---|
| 13 | `starvio-admin.html` |

---

## LANGKAH 4 — CARA BUILD TIAP HALAMAN

Untuk setiap halaman, ikuti urutan ini persis:

```
1. Baca spec file halaman tersebut (version 3.0/prompts/XX-namahalaman.md)
2. Baca file reference-nya (lihat bagian ## Reference di spec file)
3. Mulai dengan HTML shell:
   - DOCTYPE, head (Google Fonts, CSS variables dari design-system)
   - Sidebar block dengan hamburger pattern (copy exact dari 00-global.md)
   - Topbar (60px height)
   - Main content wrapper
4. Tambah CSS mobile responsive (breakpoints dari 00-global.md)
5. Build HTML content sesuai spec
6. Tambah JS:
   - loadU() → redirect ke login jika null (kecuali login/onboarding/checkin)
   - Render functions
   - bootSidebar()
   - Event listeners
7. Pastikan semua link antar halaman tidak broken
8. Test mental: buka halaman ini dengan data dari seed — apakah semua section muncul?
```

---

## LANGKAH 5 — ATURAN YANG TIDAK BOLEH DILANGGAR

Ini sudah ada di `00-global.md` bagian MUST-NOT DO LIST, tapi repeat di sini karena kritis:

1. **Sidebar LIGHT** — `var(--bg2)` / white. Bukan dark.
2. **Template WA = SELECT ONLY** — tidak bisa diedit teksnya
3. **Icon emoji = dropdown pre-made** — bukan input manual
4. **Nomor HP** — strip leading 0 real-time, simpan dengan country code (628xxx)
5. **Semua data dari localStorage `starvio_user`** — tidak ada hardcoded dummy di halaman production
6. **`starvio-admin.html` tidak pernah dilink dari app user**
7. **Onboarding flow = LOCKED** — jangan ubah flow 5-step tanpa instruksi eksplisit
8. **`DATA_VERSION: 4`** — harus match di seed data dan di `loadU()` check
9. **Bahasa UI = Indonesia informal** — "Kamu", "Yuk", bukan "Anda"
10. **Prototype actions** (Google OAuth, WA send, payment) = simulasikan dengan setTimeout + visual feedback

---

## CARA KERJA EFISIEN

- **Satu halaman per sesi** — jangan coba build semua sekaligus
- **Perubahan kecil pakai `str_replace`** — jangan rebuild seluruh file kalau cuma fix 1 bug
- **Kalau ada keputusan desain yang ambigu** — tanya dulu, jangan asumsikan sendiri
- **Setelah selesai satu phase** — mention checkpoint apa yang sudah dicapai sebelum lanjut

---

## MULAI SEKARANG

Setelah semua file dibaca, konfirmasi dengan:
1. Summary singkat: berapa halaman yang perlu dibangun, phase plan apa
2. Tanya: **"Mulai dari Phase 1 - seed data dulu?"**

Tunggu konfirmasi sebelum mulai nulis kode.
