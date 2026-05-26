# Naposo HKBP Ujung Menteng — Changelog & Release Notes

> Dokumentasi perubahan dari versi lama (deployed) ke versi terbaru yang siap deploy.
> Berdasarkan diff kode sumber + arsip dev log Sesi 41 s/d Sesi 60.

---

## Ringkasan Singkat

| Aspek | Versi Lama (Deployed) | Versi Baru (Ready to Deploy) |
|---|---|---|
| SW Cache | `naposo-v6` / `naposo-v7` | `naposo-v9` |
| PWA Shortcuts | Kalender, Reversement | **+ Beranda** |
| Shared Utils | Tersebar di `index.js` & `kalender.js` | Terpusat di `js/utils.js` |
| Halaman | index, kalender, reversement, statistik | Sama + UI lebih lengkap |
| Fitur Admin | Login dasar, kelola event/banner/dokumen | + Kelola Recap, Activity Log, Role Badge, Logout Confirm |
| Search | Hanya di beranda (di dalam main) | Pindah ke header, berlaku di semua halaman |
| Recap | Hardcode / belum ada | Dinamis dari Supabase + modal galeri + lightbox |
| Reversement | Pagination, search | + Reaction emoji, badge "Baru", deep link, edit form lengkap |
| Event display | Grid statis 3 kolom | Side-scroll 6 card + scroll indicator |

---

## Daftar Perubahan Lengkap

### 🆕 File Baru

#### `js/utils.js`
Modul shared utility yang dipindah dari `index.js` dan `kalender.js` untuk menghindari duplikasi kode.

Berisi:
- `escapeHTML(str)` — sanitasi HTML
- `localDateStr(d)` — helper tanggal lokal (hindari bug timezone UTC vs WIB)
- `isBirthdayEv(ev)` + konstanta `BDAY_CATS` — deteksi event ulang tahun
- `showToast(msg, type)` — notifikasi toast canonical dengan null guard dan timeout 3000ms
- `driveToThumbnail(url)` — konversi Google Drive share URL ke thumbnail `lh3.googleusercontent.com`

> **Perlu diperhatikan saat deploy:** `reversement.html` sekarang wajib load `<script src="js/utils.js">` sebelum `reversement.js`. Tanpa ini, `escapeHTML` dan `showToast` tidak akan terdefinisi.

---

### 🏠 Beranda (`index.html` + `js/index.js` + `css/index.css`)

#### Tampilan & Layout

- **Hero sub-text diperbarui** — dari `"Selamat datang Naps! Temukan jadwal kegiatan..."` menjadi `"Shalom, Naps. Cek kegiatan Naposo dan renungan terbaru."` (ID) / `"Hello, Naps. Check out the latest Naposo activities and devotionals."` (EN)
- **Hero tags dihapus** — shortcut filter kategori (Ibadah, Koor, Pelayanan, Kesehatian, Doa) dihilangkan karena membingungkan pengguna baru
- **Widget Renungan Terbaru didesain ulang** — dari layout horizontal (gambar kotak + teks) menjadi poster portrait 9:16 (`width:180px`) di kiri + kolom detail di kanan (judul, meta, ayat, excerpt dengan border emas, CTA)
- **Footer visit counter** — label berubah dari `"kunjungan"` menjadi `"kunjungan bulan ini"` / `"visits this month"`

#### Events Grid: Side-Scroll

- **Layout berubah dari grid ke flex row** — `events-grid` kini `display:flex; flex-direction:row; overflow-x:auto; scroll-snap-type:x mandatory`
- **Jumlah card ditambah** — semua platform menampilkan hingga 6 card (sebelumnya desktop 3, mobile 4)
- **Mobile layout vertikal** — kartu mobile kembali ke thumbnail 16:9 atas + info bawah, lebar `88vw`, side-scroll (bukan horizontal card seperti sempat dicoba di Sesi 48)
- **`events-section` overflow** — `overflow:hidden` → `overflow:visible` agar card ke-4+ tidak terpotong saat scroll
- **Scroll indicator baru:**
  - Desktop/tablet: progress bar tipis 3px di bawah grid, thumb bergerak mengikuti scroll
  - Mobile: dot indikator (6 titik), dot aktif melebar jadi pill
  - Mobile: swipe hint `"Geser untuk lihat lebih →"` muncul sekali, fade out 3 detik, disimpan di `localStorage naposo_swipe_seen`

#### Search Bar

- **Dipindah ke dalam `<header>`** — tidak lagi berada di `<main>`. Sekarang ada di `.hdr-left`, di samping brand
- **Muncul di semua halaman** — `reversement.html` dan `kalender.html` juga punya search bar di header
- **Search dropdown lebih lengkap** — menampilkan hasil event *dan* renungan sekaligus, bukan hanya event
- **Search keyboard** — support `Esc` untuk close dropdown, tombol `✕` untuk clear
- **Race condition guard** — `_searchReqId` counter mencegah hasil lama menimpa hasil baru
- **Styling** — background `rgba(255,255,255,.15)`, border `rgba(255,255,255,.25)`, teks putih, konsisten dengan tema header

#### Field Thumbnail Card Terpisah

- **Kolom baru `thumbnail_url`** di tabel `events` Supabase — opsional, untuk gambar card 16:9 yang berbeda dari poster 9:16 modal
- **Form "Ubah Kegiatan"** di beranda kini punya field `🖼 Thumbnail Card` (opsional, di bawah Link)
- **Logic render card** — prioritaskan `thumbnail_url` → fallback ke poster kategori (perilaku lama)
- **`saveEditEvent`** — kirim `thumbnail_url` di payload + hitung `diff` untuk log ke `event_logs`

#### Birthday Modal

- **Modal ucapan ulang tahun** — popup muncul otomatis jika ada event ulang tahun hari ini, menampilkan ayat & ucapan random per orang
- **Tombol** — `"🙏 Amin!"` (sebelumnya sempat `"🎊 Amin & Terima Kasih!"`)

#### Performance

- **`loadData()` paralel** — `categories`, `events`, `home_docs`, `reversement_posts` dari sequential `await` diubah ke `Promise.allSettled([...])`. `events` tetap throw jika gagal; sisanya graceful fallback

#### i18n

- Label-label baru di objek `T` (sebelumnya tidak ada):
  - `lbEditLink`, `lbEditThumbnail` — form ubah kegiatan
  - `editDraftLabel`, `editThumbnailHint`, `editTitlePlaceholder`, `editNotePlaceholder`, `editCaptionPlaceholder`, `editLinkPlaceholder`
  - `bdayModalTitle`, `bdayModalSub`, `bdayModalBtn`
  - `confirmTitle`
  - `searchPlaceholder`, `loginSelectDefault`, `loginErr`, `loginPwPlaceholder`
  - `recapTabPhoto`, `recapTabVideo`, `rlbDriveLinkTxt`
  - `actLogLoading`, `actLogEmpty`, `actLogError`
  - `revWidgetTitle`, `revWidgetSeeAll`
  - `footerVisitLbl` diperbarui ke `"kunjungan bulan ini"`
  - Label-label banner, dokumen, recap admin (lihat bagian Admin)
- **Placeholders di-set lewat `applyLang()`** — semua placeholder input kini ikut bahasa yang dipilih

---

### 📅 Kalender (`kalender.html` + `js/kalender.js` + `css/kalender.css`)

#### Header Sticky

- Header kalender dari `position:relative` → `position:sticky; top:0; z-index:400`
- Cascade disesuaikan: `admin-bar → top:var(--hh)`, `toolbar → top:var(--hh)`, `body.admin-mode .toolbar → top:calc(var(--hh)+36px)`
- Search bar ditambah di header kalender (`onSearchInput` sudah ada, tinggal dipasang UI)

#### Thumbnail pada Form Tambah Event

- Field baru `🖼 Thumbnail Card` di form kalender (di bawah Catatan)
- `saveEvent` sudah menyertakan `thumbnail_url` di payload INSERT, UPDATE, dan semua recurring instance
- `openAddModal` clear field; `_doOpenEditModal` populate dari `ev.thumbnail_url`
- i18n: `lbThumbnail` ditambah ke objek `T`

#### Recurring Events: Extend ke Kuartal Berikutnya

- Tombol **"Perpanjang"** di detail modal event recurring — admin bisa extend seri ke kuartal berikutnya tanpa membuat ulang dari awal
- `extendRecurGroup(groupId)` — fetch semua instance, generate tanggal baru ke kuartal berikutnya, insert lewat `dbWrite`
- Helper baru: `recurNextQuarterStart(dateStr)`, `recurQuarterEnd(startStr)`

#### Upload Banyak Foto Galeri

- Input `galleryUrl` (single) → `<textarea id="galleryUrls">` — admin bisa paste banyak URL sekaligus, satu per baris

#### Admin Menu Kalender

- **"Kelola Recap" dihapus** dari dropdown admin kalender (Sesi 59) — fitur ini ada di beranda, tidak relevan di konteks kalender
- Admin dropdown dilengkapi dengan sections: **Aksi Cepat**, **Log Aktivitas**, **Akun**

#### Bugfix

- `showToast` diseragamkan — null guard `if(!el)return;`, order class `err/ok` diperbaiki, timeout dari `3200` → `3000`
- `isBirthdayEv is not defined` di kalender diperbaiki (sebelumnya hanya ada di `index.js`, sekarang di `utils.js`)
- Tooltip hover: ucapan ulang tahun di kalender
- Detail modal: field `nama` event ulang tahun tampil sebagai ucapan
- Tooltip URL tampil sebagai `"Buka ↗"` (bukan raw URL)
- Timezone `toISOString()` → `localDateStr()` untuk hindari bug WIB+7

---

### 📖 Reversement (`reversement.html` + `js/reversement.js` + `css/reversement.css`)

#### Reaction Emoji (Fitur Baru)

- 3 reaction: **🙏 Amin**, **❤️ Tersentuh**, **✨ Menguatkan** — di bawah teks renungan (modal desktop + bottom sheet mobile)
- Satu reaksi per post per device; klik lagi untuk toggle off
- Disimpan `localStorage` key `rev_rx_{postId}`; session key via `sessionStorage + crypto.randomUUID()`
- Count update optimistic, sync ke Supabase tabel `reversement_reactions`
- Graceful fallback jika tabel belum ada atau network gagal

> **SQL yang perlu dijalankan jika belum:**
> ```sql
> CREATE TABLE reversement_reactions (
>   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
>   post_id text NOT NULL,
>   type text NOT NULL CHECK (type IN ('amin','tersentuh','menguatkan')),
>   user_key text NOT NULL,
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(post_id, user_key)
> );
> ALTER TABLE reversement_reactions ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "public read" ON reversement_reactions FOR SELECT USING (true);
> CREATE POLICY "public insert" ON reversement_reactions FOR INSERT WITH CHECK (true);
> CREATE POLICY "public delete own" ON reversement_reactions FOR DELETE USING (true);
> ```

#### Badge "Baru"

- Badge **"Baru"** muncul di pojok kanan atas card post paling baru (halaman 1, index 0, published)
- Animasi CSS `@keyframes rev-pop`
- Bug sebelumnya: badge muncul di post pertama *setiap halaman* pagination — sudah diperbaiki dengan guard `_currentPage===1 && idx===0`

#### Deep Link

- URL `?id=<postId>` langsung membuka modal renungan tersebut saat `init()`, tanpa bergantung `POSTS.find()`

#### Bugfix & Polish

- `openRevModal` fallback bertingkat — cari di `POSTS` → `_allPostsCache` → fetch individual Supabase. Fix modal tidak terbuka saat klik hasil search dari halaman 2+
- `series` → `series_name` diseragamkan (mismatch key antara save/prefill/render)
- Field `excerpt` ditambah ke form admin, payload, prefill, reset, dirty-state tracking
- `onRevSearch` menyertakan `dayFilter` saat fetch `_allPostsCache`
- `clearRevSearch()` ditambahkan
- Poster: `drive.google.com/thumbnail` diperbaiki ke format `lh3.googleusercontent.com`
- `openRevAdmin` yang tidak ada diganti ke `openAdminForm()` — tombol "Tambah Renungan" di admin dropdown kini bisa diklik
- `reversement.html` kini load `js/utils.js` — duplikat `escapeHTML` dan `showToast` dihapus dari `reversement.js`

#### Reaction Cache

- `fetchReactions(postId, {force=false})` — skip fetch jika cache fresh (5 menit). Post-toggle tetap `force:true`

#### Pagination

- Pagination server-side 6 post per halaman (via Supabase `Range` header) — sudah ada di versi sebelumnya, diperkuat dengan search cache + dayFilter

---

### 🖼️ Recap (Fitur Baru Sepenuhnya)

Recap adalah carousel foto/galeri kegiatan di beranda. Sebelumnya hardcode, sekarang dinamis dari Supabase.

#### Database

- Tabel baru `recap_items`: judul, kategori, tanggal, cover URL, warna background, `folder_id` Drive, `photo_count`, urutan, toggle aktif
- Kolom `photo_count INTEGER DEFAULT NULL` di `recap_items` — pre-fill count dari DB, update setelah fetch Drive selesai

#### Edge Function `drive-gallery`

- Fetch daftar file dari Google Drive folder via Drive API v3
- Pagination `do...while` dengan `nextPageToken`, `pageSize=1000` — handle 400+ foto
- Filter `mimeType`: hanya `image/*` dan `video/*` — subfolder dan Google Docs di-skip
- Output: array `{id, name, type, thumbnail, src, driveLink}`

#### Modal Galeri Recap

- Klik card recap → modal detail: header (tag, judul, tanggal, count foto/video), tab **Foto** / **Video**, grid thumbnail (4 kolom desktop, 3 mobile), grid video dengan play button
- **Lightbox foto inline** — thumbnail jadi `<button>`, klik buka lightbox full-screen
- Lightbox: navigasi prev/next (tombol + keyboard `←` `→` `Esc` + swipe touch), fade transisi, caption `nama · 7/100`, link "Buka di Drive ↗"
- `#recapLightbox` adalah elemen standalone `position:fixed; z-index:3000` di luar `.modal` (tidak jadi child modal, agar tidak terpotong overflow)
- Tombol × recap modal tidak lagi tertutup saat gallery panjang (`flex-shrink:0`)
- Auto-extract `folder_id` — paste full URL Drive → otomatis strip ke ID saja

#### Admin Kelola Recap

- Entry `🖼️ Kelola Recap` di 3 tempat: admin dropdown, hamburger mobile, bottom sheet
- Modal admin CRUD lengkap: Judul, Kategori, Tanggal, Cover URL, Warna BG, Folder ID Drive, Jml Foto, Urutan, toggle Aktif
- Setelah save/delete, carousel beranda refresh otomatis via `renderRecap()`
- **Kelola Recap bisa diakses semua admin** (tidak perlu role `superadmin` — diubah di Sesi 59)

#### Scroll Recap

- Progress bar scroll (bukan tombol ←/→ lagi) mengikuti scroll carousel

---

### 👮 Fitur Admin (Semua Halaman)

#### Admin Active Dot

- Dot hijau kecil 7px + animasi `admin-dot-pulse` muncul di sebelah tombol Login saat admin aktif
- Berlaku di `index.html`, `kalender.html`, `reversement.html`

#### Logout Confirmation

- `confirmLogout()` dengan `window.confirm()` sebelum `doLogout()` — berlaku di semua entry point logout ketiga halaman

#### Activity Log di Bottom Sheet

- `loadAdminActivityLog()` — fetch 10 entri terbaru dari `event_logs`, dirender sebagai list compact
- Max-height 160px dengan scroll
- Dipanggil saat login berhasil, buka bottom sheet (jika admin aktif), klik tombol ↻

#### Role Badge

- Badge `superadmin` muncul di bottom sheet jika role terdeteksi
- `isSuperAdmin()` kini selalu `return true` (Sesi 59) — semua admin punya akses penuh

#### Konsistensi UI Modal Admin

- Semua modal admin (Dokumen, Recap, Pengumuman) mengikuti pola: form di atas → section label → daftar di bawah
- Tombol edit seragam: `btn btn-ghost btn-sm` + icon `✎`
- Tombol hapus seragam: `btn btn-ghost btn-sm` + `style="color:var(--red)"` + icon `×`
- Admin dropdown diperlebar `min-width: 210px` (dari 180px) agar "Kelola Pengumuman" tidak wrap

#### Rename Menu

- `"Pengumuman"` → `"Kelola Pengumuman"` di semua entry point (dropdown, hamburger, bottom sheet, i18n)

#### Konsistensi Admin Dropdown Lintas Halaman

- `.admin-dd-section` dan `.admin-dd-sep` kini juga didefinisikan di `kalender.css` dan `reversement.css` (sebelumnya hanya di `index.css`)
- Label "Aksi" di dropdown kini tampil dengan uppercase + letter-spacing di semua halaman

#### dbWrite Signature

- `dbWrite(table, method, data, match)` → `dbWrite(table, method, data, match, log)` — parameter ke-5 untuk log activity

---

### 📊 Statistik (`statistik.html`)

- **Filter bar** — filter Tahun, Bulan Awal, Bulan Akhir, dan Kategori
- **`LABELS`/`COLORS`** yang sebelumnya didefinisikan 4× diganti `CAT_LABELS`/`CAT_COLORS` global sekali deklarasi
- Link statistik muncul di navbar sebagai pill `📊 Statistik` saat admin aktif

---

### ⚙️ Service Worker & PWA (`sw.js` + `manifest.json`)

- **Cache versi naik** dari `naposo-v6`/`naposo-v7` → `naposo-v9`
- **`js/utils.js` ditambah ke `STATIC_ASSETS`** — wajib agar utils.js ter-cache
- **`statistik.html` ditambah ke `STATIC_ASSETS`** — sebelumnya tidak masuk precache
- **PWA shortcut baru: Beranda** — sebelumnya hanya Kalender dan Reversement
- **`sessionKey` diperbarui** — dari `localStorage + Date.now()` → `sessionStorage + crypto.randomUUID()` (fallback `Date.now()+Math.random(36)`)

---

### 🐛 Bugfix Lainnya

| Bug | Fix |
|---|---|
| Dropdown filter kategori kalender terpotong di desktop | `position:fixed` + `getBoundingClientRect()` |
| Regex `driveToThumbnail` gagal parse URL | `[^/?\\s]+` → `[\\w-]+` |
| Extra fields hilang saat edit event dari beranda | Form pakai `#editExtraWrap` dinamis, konsisten dengan form kalender |
| `SEED` array 7200 karakter di kalender.js diparse browser tiap load | Dihapus |
| Tombol Login tidak bisa diklik karena kondisi salah | Diperbaiki |
| Tombol Logout tidak bisa diklik | Diperbaiki |

---

### 🗂️ Perubahan File Lain

- **`css/index.css.bak`** dan **`js/index.js.bak`, `js/kalender.js.bak`** — file backup sementara, tidak perlu di-deploy (bisa dihapus dari repo)
- **`.vscode/settings.json`** — konfigurasi lokal, tidak perlu di-deploy

---

## Checklist Sebelum Deploy

- [ ] Pastikan tabel `reversement_reactions` sudah dibuat di Supabase (lihat SQL di atas)
- [ ] Pastikan tabel `recap_items` sudah dibuat di Supabase
- [ ] Pastikan kolom `thumbnail_url` sudah ada di tabel `events`
- [ ] Pastikan kolom `photo_count` sudah ada di tabel `recap_items`
- [ ] Pastikan Edge Function `drive-gallery` sudah di-deploy ke Supabase
- [ ] Pastikan `GOOGLE_DRIVE_API_KEY` sudah diset di Supabase secrets
- [ ] Setelah deploy: buka DevTools → Application → Clear site data → refresh (agar SW lama `naposo-v6`/`v7` tidak memblokir aset baru)
- [ ] File `.bak` bisa dihapus dari repo setelah deploy aman

---

*Changelog ini dibuat berdasarkan diff kode `naposo-kalender-main_3` (versi lama) vs `naposo-kalender` (versi baru) dan arsip dev log Sesi 41–60.*
