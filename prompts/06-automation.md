# Page: AUTOMATION (`getstarvio-automation.html`)

> **Cara pakai:** Paste `00-global.md` dulu, lalu paste file ini, lalu instruksi spesifik kamu.

---

## Tujuan Halaman

Konfigurasi pengiriman pengingat otomatis via WhatsApp — kapan dikirim, pakai template apa, per kategori layanan.

---

## Must-Have

### Master Toggle Card (atas konten — LIGHT theme)
- Card background = `var(--bg2)` (putih) — **bukan** dark `var(--ink)`
- Label: "Automation" + badge ON/OFF
- Toggle switch on/off global. Jika off, tidak ada pengingat yang dijadwalkan.
- Simpan state ke localStorage (`getstarvio_user.automationEnabled`)
- Tampilkan "Kirim pukul" waktu + timezone di sebelah toggle
- **WA Connection Status** ada DI DALAM master card (border-top separator):
  - Dot status (hijau/merah), label "WhatsApp terhubung/terputus", nomor WA
  - Tombol "Hubungkan ulang" → buka QR reconnect modal (di halaman ini)
  - QR reconnect modal: scan QR + "Simulasi Terhubung" button

### Card: Pengaturan Default
- Default interval: number input (hari)
- Jam kirim: time picker (contoh: 09:00 WIB)
- Timezone: select dropdown

### Section: Pengaturan per Kategori (Flow Cards)
- List semua `cats[]` — setiap kategori = 1 flow card
- Per card: ikon, nama, interval (bisa diedit langsung), template selector, toggle on/off per kategori
- Jika kategori di-toggle off, pengingat untuk layanan ini tidak dikirim
- **Explicit "Simpan" button per card** — tidak auto-save saat template atau interval berubah
- Preview template updates live saat dropdown berubah, tapi save ke localStorage hanya saat klik "Simpan"

### WA Template Selector (per kategori)
- Dropdown pilihan template pre-made
- Template PRE-MADE — admin hanya bisa SELECT, tidak bisa edit konten
- Template harus di-approve Meta sebelum bisa dipakai di Cloud API (status approval shown via webhook)
- Preview template tampilkan body pesan dengan placeholder: `{customer_name}`, `{service}`, `{business_name}`, `{days}`
- Template yang tersedia (pre-made, read-only, sama dengan di Kategori):
  1. **Pengingat balik** (`reminder_return`) — gentle reminder untuk kembali
  2. **Ajakan santai** (`soft_invite`) — tone casual/friendly
  3. **Pengingat + penawaran** (`promo_nudge`) — sebut penawaran
  4. **Check-in personal** (`care_checkin`) — gimana kondisi kamu?
  5. **Gentle urgency** (`urgency_light`) — soft urgency reminder

### Card: Status Kredit
- Saldo saat ini `remLeft` dengan warna state (lime/amber/red/dark)
- Progress bar: `remLeft / remMax`
- Tombol "Top Up Kredit" → `getstarvio-billing.html`

---

## Reference

- **Version acuan:** `version 2.0/getstarvio-automation.html`
- **Template WA:** pre-made, SELECT only — AI sering mencoba tambahkan textarea untuk edit konten, jangan
- Master toggle card = LIGHT theme (`var(--bg2)` background) — AI sering membuat dark, jangan
- WA reconnect button + QR modal ada DI master card (bukan di Settings)
- Settings page TIDAK punya WA reconnect — sudah pindah ke sini
- Master toggle harus prominent di atas — jika off, semua setting lain di-grey out
- Card Status Kredit penting untuk konteks — jangan dihilangkan dari halaman ini

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-03-26 | File dibuat, spec awal |
| 2026-03-26 | Tambah Reference section — acuan v2.0, template read-only |
| 2026-03-26 | Sync: Master toggle card = LIGHT theme (not dark). WA reconnect + QR modal IN master card (not Settings). Settings no longer has WA reconnect. |
| 2026-03-26 | Sync: per-category flow cards have explicit "Simpan" button (no auto-save on template/interval change). Preview updates live but save is manual. |
| 2026-04-18 | UI copy "reminder" → "pengingat". Template names: "Reminder balik" → "Pengingat balik", "Reminder + penawaran" → "Pengingat + penawaran". Added template approval (Meta Cloud API) note. |
