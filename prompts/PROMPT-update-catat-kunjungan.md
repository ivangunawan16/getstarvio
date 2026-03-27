# PROMPT: Update Catat Kunjungan — Tanggal Toggle (Opsi C)

> **File target:** `version 3.0/getstarvio-catat-kunjungan.html`
> **Paste `00-global.md` dulu, lalu paste file ini.**

---

## Konteks

Saat ini di Step 2 modal Catat Kunjungan, field tanggal kunjungan bersifat **readonly** dan selalu menampilkan hari ini. Kita mau menambahkan escape hatch agar staff bisa backdate kunjungan (misalnya lupa catat kemarin) **tanpa mengorbankan kecepatan flow utama**.

---

## Perubahan yang Diminta

### 1. Ubah field tanggal di Step 2 (found-card)

**Sebelum (current):**
```html
<div class="date-row" style="margin-top:8px">
  <span class="date-label">Tanggal Kunjungan</span>
  <input type="date" class="date-input" id="visit-date" readonly style="background:var(--bg3);color:var(--ink3)">
</div>
```

**Sesudah:**
```html
<div class="date-row" style="margin-top:8px">
  <span class="date-label">Tanggal Kunjungan</span>
  <input type="date" class="date-input" id="visit-date" readonly style="background:var(--bg3);color:var(--ink3)">
  <a href="#" class="date-toggle" id="date-toggle" onclick="enableDateEdit(event)">Bukan hari ini?</a>
</div>
```

### 2. Styling untuk `.date-toggle`

Tambahkan CSS:

```css
.date-toggle{
  font-size:11px;
  color:var(--blue);
  font-weight:600;
  margin-top:4px;
  cursor:pointer;
  text-decoration:none;
  display:inline-block;
}
.date-toggle:hover{
  text-decoration:underline;
}
```

### 3. JavaScript: `enableDateEdit(event)`

Tambahkan function baru:

```javascript
function enableDateEdit(e) {
  e.preventDefault();
  var input = document.getElementById('visit-date');
  var toggle = document.getElementById('date-toggle');

  // Ubah input jadi editable
  input.removeAttribute('readonly');
  input.style.background = 'var(--bg2)';
  input.style.color = 'var(--ink)';
  input.style.borderColor = 'var(--lime2)';
  input.focus();

  // Set max date = hari ini (tidak boleh masa depan)
  input.max = todayISO();

  // Set min date = 7 hari ke belakang
  var minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  input.min = minDate.toISOString().split('T')[0];

  // Ubah link text
  toggle.textContent = 'Maks 7 hari ke belakang';
  toggle.style.color = 'var(--ink3)';
  toggle.style.cursor = 'default';
  toggle.onclick = null;
}
```

### 4. Reset saat modal dibuka ulang

Di function yang mempersiapkan Step 2 (saat customer dipilih / `showStep2` / tempat `visit-date` di-set ke `todayISO()`), **tambahkan reset:**

```javascript
// Reset date field to readonly (hari ini)
var dateInput = document.getElementById('visit-date');
dateInput.value = todayISO();
dateInput.setAttribute('readonly', true);
dateInput.style.background = 'var(--bg3)';
dateInput.style.color = 'var(--ink3)';
dateInput.style.borderColor = 'var(--border)';
dateInput.removeAttribute('max');
dateInput.removeAttribute('min');

// Reset toggle link
var toggle = document.getElementById('date-toggle');
toggle.textContent = 'Bukan hari ini?';
toggle.style.color = 'var(--blue)';
toggle.style.cursor = 'pointer';
toggle.onclick = function(e) { enableDateEdit(e); };
```

Cari tempat di code yang ada baris ini:
```javascript
document.getElementById('visit-date').value = todayISO()
```
dan tambahkan reset code di atas **tepat setelah baris itu**.

### 5. Update Step 3 (Konfirmasi)

Di summary/konfirmasi (Step 3), kalau tanggal bukan hari ini, tampilkan **warning kecil**:

```javascript
// Di dalam function yang generate summary (updateSelectedServices atau serupa)
var date = document.getElementById('visit-date').value;
var isBackdate = (date !== todayISO());

// Tambahkan ke summary HTML:
if (isBackdate) {
  html += '<div style="margin-top:8px;padding:8px 10px;background:var(--amber-bg);border:1px solid #fcd88a;border-radius:var(--r-sm);font-size:11px;color:var(--amber-dk);font-weight:600">';
  html += '⚠️ Kunjungan akan dicatat untuk tanggal ' + date + ' (bukan hari ini)';
  html += '</div>';
}
```

### 6. Kunjungan Hari Ini section

Section "Kunjungan Hari Ini" di bawah hanya menampilkan kunjungan dengan tanggal hari ini. **Kalau staff backdate, kunjungan itu TIDAK muncul** di section "Kunjungan Hari Ini" — ini sudah benar by design, tidak perlu diubah. Kunjungan backdate bisa dilihat di halaman Pelanggan.

---

## Yang TIDAK Boleh Diubah

- Jangan ubah Step 1 (search pelanggan) — tetap sama
- Jangan ubah flow 3 tahap (tetap 3 step)
- Jangan ubah save logic — `saveVisit()` sudah baca value dari `#visit-date`, jadi otomatis akan pakai tanggal yang dipilih
- Jangan ubah section "Kunjungan Hari Ini" — tetap filter berdasarkan hari ini saja
- Jangan ubah style/layout lain yang tidak disebut di sini
- Jangan tambah fitur baru selain yang disebutkan

---

## Validasi Setelah Selesai

1. Buka modal → Step 2 → field tanggal menampilkan hari ini, readonly, ada link "Bukan hari ini?"
2. Klik "Bukan hari ini?" → field jadi editable, bisa pilih tanggal, max hari ini, min 7 hari lalu
3. Pilih tanggal kemarin → lanjut ke Step 3 → ada warning "⚠️ Kunjungan akan dicatat untuk tanggal ... (bukan hari ini)"
4. Simpan → kunjungan tersimpan dengan tanggal yang dipilih
5. Kunjungan backdate TIDAK muncul di "Kunjungan Hari Ini"
6. Tutup modal, buka lagi → field tanggal kembali readonly hari ini, link kembali "Bukan hari ini?"
