# PROMPT: Update Pelanggan — Single Toolbar (Opsi 2)

> **File target:** `version 3.0/getstarvio-pelanggan.html`
> **Paste `00-global.md` dulu, lalu paste file ini.**

---

## Konteks

Saat ini halaman Pelanggan punya 3 baris kontrol yang visual-nya berantakan:
1. Metric cards (4 kolom: Total, Aktif, Mendekati, Hilang) — bisa diklik untuk filter
2. Filter chips (Semua, Aktif, Mendekati, Hilang) + search input
3. Sort buttons (Paling Mendesak, A-Z Nama, Terlama, Terbaru)

Masalah: metric cards dan filter chips punya fungsi redundant. Terlalu banyak baris kontrol untuk halaman list.

**Solusi:** Hapus metric cards dan sort buttons. Gabungkan semuanya jadi **satu baris toolbar** — filter chips (dengan count badge), sort dropdown, dan search input.

---

## Perubahan yang Diminta

### 1. HAPUS: Metric Cards

Hapus seluruh block `.met-grid` dari HTML:

```html
<!-- HAPUS SELURUH BLOCK INI -->
<div class="met-grid">
  <div class="met" id="met-total" onclick="filterByMet('all')">...</div>
  <div class="met lime" id="met-aktif" onclick="filterByMet('aktif')">...</div>
  <div class="met amber" id="met-mendekati" onclick="filterByMet('mendekati')">...</div>
  <div class="met red" id="met-hilang" onclick="filterByMet('hilang')">...</div>
</div>
```

Hapus juga CSS yang terkait: `.met-grid`, `.met`, `.met-lbl`, `.met-val`, `.met-sub`, `.met.lime`, `.met.amber`, `.met.red`, `.met.selected`.

### 2. HAPUS: Baris Filter Chips dan Baris Sort Buttons terpisah

Hapus kedua `<div>` ini:

```html
<!-- HAPUS: baris filter + search -->
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
  <div class="chips" style="flex:1">...</div>
  <input class="fi" placeholder="Cari nama atau WA..." ...>
</div>

<!-- HAPUS: baris sort -->
<div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;flex-wrap:wrap">
  <span class="sort-lbl">Urutkan:</span>
  <button class="sort-btn active" ...>Paling Mendesak ⓘ</button>
  ...
</div>
```

### 3. TAMBAH: Single Toolbar (ganti semua yang dihapus di atas)

Taruh tepat sebelum `<!-- EMPTY STATE -->` dan sesudah `</div>` penutup `.met-grid` yang sudah dihapus:

```html
<!-- SINGLE TOOLBAR -->
<div class="toolbar">
  <div class="toolbar-filters">
    <button class="filter-chip active" data-filter="all" onclick="filterCx(this,'all')">
      Semua <span class="filter-count" id="fc-all">0</span>
    </button>
    <button class="filter-chip" data-filter="aktif" onclick="filterCx(this,'aktif')">
      Aktif <span class="filter-count fc-lime" id="fc-aktif">0</span>
    </button>
    <button class="filter-chip" data-filter="mendekati" onclick="filterCx(this,'mendekati')">
      Mendekati <span class="filter-count fc-amber" id="fc-mendekati">0</span>
    </button>
    <button class="filter-chip" data-filter="hilang" onclick="filterCx(this,'hilang')">
      Hilang <span class="filter-count fc-red" id="fc-hilang">0</span>
    </button>
  </div>

  <div class="toolbar-right">
    <!-- Sort Dropdown -->
    <div class="sort-dropdown" id="sort-dropdown">
      <button class="sort-trigger" onclick="toggleSortDropdown()">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
        <span id="sort-label">Mendesak</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 6l4 4 4-4"/></svg>
      </button>
      <div class="sort-menu" id="sort-menu">
        <button class="sort-option active" onclick="setSort('urgency', 'Mendesak', this)">
          <span>Paling Mendesak</span><span class="sort-check">✓</span>
        </button>
        <button class="sort-option" onclick="setSort('name', 'A–Z Nama', this)">
          <span>A–Z Nama</span><span class="sort-check">✓</span>
        </button>
        <button class="sort-option" onclick="setSort('oldest', 'Terlama', this)">
          <span>Terlama</span><span class="sort-check">✓</span>
        </button>
        <button class="sort-option" onclick="setSort('newest', 'Terbaru', this)">
          <span>Terbaru</span><span class="sort-check">✓</span>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
      <input class="fi search-input" placeholder="Cari nama atau WA..." id="cx-q" oninput="renderCards()">
    </div>
  </div>
</div>
```

### 4. CSS untuk Toolbar

Hapus CSS lama: `.chips`, `.chip`, `.chip.active`, `.sort-lbl`, `.sort-btn`, `.sort-btn.active`.

Tambahkan CSS baru:

```css
/* ── TOOLBAR ── */
.toolbar{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:14px;
  flex-wrap:wrap;
}
.toolbar-filters{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
}
.toolbar-right{
  display:flex;
  gap:8px;
  align-items:center;
  margin-left:auto;
}

/* Filter Chips */
.filter-chip{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 12px;
  border-radius:99px;
  font-size:11px;
  font-weight:600;
  font-family:inherit;
  background:var(--bg2);
  border:1.5px solid var(--border);
  color:var(--ink2);
  cursor:pointer;
  transition:all .15s;
  user-select:none;
}
.filter-chip:hover{border-color:var(--border2)}

/* Active states per filter */
.filter-chip.active[data-filter="all"]{
  background:var(--ink);color:#fff;border-color:var(--ink);
}
.filter-chip.active[data-filter="aktif"]{
  background:var(--lime-bg);color:var(--lime-dk);border-color:var(--lime2);
}
.filter-chip.active[data-filter="mendekati"]{
  background:var(--amber-bg);color:var(--amber-dk);border-color:#fcd88a;
}
.filter-chip.active[data-filter="hilang"]{
  background:var(--red-bg);color:var(--red-dk);border-color:#f5c5c3;
}

/* Count badge inside chip */
.filter-count{
  font-family:'JetBrains Mono',monospace;
  font-size:10px;
  font-weight:700;
  padding:0 5px;
  border-radius:99px;
  background:rgba(0,0,0,.08);
  min-width:18px;
  text-align:center;
  line-height:16px;
}
.filter-chip.active[data-filter="all"] .filter-count{
  background:rgba(255,255,255,.2);color:#fff;
}
.filter-chip.active[data-filter="aktif"] .filter-count{
  background:rgba(45,74,0,.1);color:var(--lime-dk);
}
.filter-chip.active[data-filter="mendekati"] .filter-count{
  background:rgba(122,79,0,.1);color:var(--amber-dk);
}
.filter-chip.active[data-filter="hilang"] .filter-count{
  background:rgba(122,26,22,.1);color:var(--red-dk);
}

/* Sort Dropdown */
.sort-dropdown{position:relative}
.sort-trigger{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 10px;
  border-radius:99px;
  font-size:11px;
  font-weight:600;
  font-family:inherit;
  background:var(--bg2);
  border:1.5px solid var(--border);
  color:var(--ink2);
  cursor:pointer;
  transition:all .15s;
  white-space:nowrap;
}
.sort-trigger:hover{border-color:var(--border2)}
.sort-menu{
  display:none;
  position:absolute;
  top:calc(100% + 4px);
  right:0;
  min-width:180px;
  background:var(--bg2);
  border:1.5px solid var(--border);
  border-radius:var(--r-sm);
  box-shadow:0 4px 16px rgba(0,0,0,.1);
  z-index:50;
  overflow:hidden;
}
.sort-menu.show{display:block}
.sort-option{
  display:flex;
  align-items:center;
  justify-content:space-between;
  width:100%;
  padding:9px 14px;
  font-size:12px;
  font-weight:500;
  font-family:inherit;
  color:var(--ink2);
  background:none;
  border:none;
  cursor:pointer;
  transition:background .1s;
  text-align:left;
}
.sort-option:hover{background:var(--bg3)}
.sort-option.active{color:var(--ink);font-weight:700}
.sort-check{display:none;color:var(--lime-dk);font-size:13px;font-weight:800}
.sort-option.active .sort-check{display:inline}

/* Search */
.search-wrap{
  position:relative;
  flex-shrink:0;
}
.search-icon{
  position:absolute;
  left:10px;
  top:50%;
  transform:translateY(-50%);
  pointer-events:none;
}
.search-input{
  padding-left:30px !important;
  width:180px;
  font-size:12px !important;
  padding-top:6px !important;
  padding-bottom:6px !important;
}

/* ── MOBILE ── */
@media(max-width:767px){
  .toolbar{flex-direction:column;align-items:stretch;gap:8px}
  .toolbar-right{width:100%}
  .search-wrap{flex:1}
  .search-input{width:100% !important}
  .toolbar-filters{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch}
  .filter-chip{flex-shrink:0}
}
```

### 5. JavaScript Perubahan

**Hapus function `filterByMet()`** — tidak diperlukan lagi karena metric cards sudah tidak ada.

**Update function `filterCx()`:**

```javascript
function filterCx(el, f) {
  cxFilter = f;
  document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  renderCards();
}
```

**Ganti function `setSort()`:**

```javascript
function setSort(s, label, el) {
  cxSort = s;
  document.getElementById('sort-label').textContent = label;
  document.querySelectorAll('.sort-option').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  closeSortDropdown();
  renderCards();
}

function toggleSortDropdown() {
  document.getElementById('sort-menu').classList.toggle('show');
}

function closeSortDropdown() {
  document.getElementById('sort-menu').classList.remove('show');
}

// Close dropdown saat klik di luar
document.addEventListener('click', function(e) {
  if (!e.target.closest('.sort-dropdown')) {
    closeSortDropdown();
  }
});
```

**Update `renderCards()`** — ganti referensi metric card IDs ke filter count IDs:

Cari baris-baris ini di `renderCards()`:
```javascript
document.getElementById('cx-aktif').textContent = a
document.getElementById('cx-near').textContent = n
document.getElementById('cx-lost').textContent = l
document.getElementById('cx-total').textContent = cxs.length
```

Ganti dengan:
```javascript
document.getElementById('fc-aktif').textContent = a;
document.getElementById('fc-mendekati').textContent = n;
document.getElementById('fc-hilang').textContent = l;
document.getElementById('fc-all').textContent = cxs.length;
```

**Hapus juga baris ini** (kalau ada referensi ke metric card lain yang sudah dihapus):
```javascript
// Hapus semua referensi ke met-total, met-aktif, met-mendekati, met-hilang, cx-aktif, cx-near, cx-lost, cx-total
```

Tapi **JANGAN hapus** `tb-sub` update di topbar — itu tetap berguna:
```javascript
document.getElementById('tb-sub').textContent = cxs.length + ' pelanggan terdaftar';
```

### 6. Topbar Sub-text

Tetap pertahankan sub-text di topbar yang menampilkan total: "42 pelanggan terdaftar". Ini jadi satu-satunya tempat angka total muncul selain di chip "Semua".

---

## Yang TIDAK Boleh Diubah

- Customer cards (`.cx-card`) — tidak diubah
- Detail panel (slide-in) — tidak diubah
- Edit modal — tidak diubah
- Add modal — tidak diubah
- Empty state — tidak diubah
- Sidebar, topbar, footer — tidak diubah
- Semua sort logic di `renderCards()` (urgency, name, oldest, newest) — logic tetap sama, hanya UI trigger yang berubah
- `?action=add` query param handling — tetap sama
- Mobile sidebar behavior — tetap sama

---

## Validasi Setelah Selesai

1. **Metric cards sudah hilang** — hanya ada satu baris toolbar
2. **Filter chips menampilkan count:** [Semua 42] [Aktif 28] [Mendekati 9] [Hilang 5]
3. **Klik chip "Hilang"** → chip berubah warna merah, count badge merah, cards terfilter hanya pelanggan hilang
4. **Klik chip "Semua"** → chip kembali hitam, semua cards muncul
5. **Sort dropdown** → klik trigger → muncul menu 4 opsi → pilih "A–Z Nama" → label trigger berubah, cards tersortir, menu tertutup
6. **Klik di luar sort dropdown** → menu tertutup
7. **Search input** → ketik nama → cards terfilter real-time. Bisa dikombinasikan dengan filter chip aktif
8. **Mobile (<768px):** toolbar vertikal, chips bisa scroll horizontal, search full-width
9. **Tidak ada referensi error ke ID lama** (cx-aktif, cx-near, cx-lost, cx-total, met-*) di console
