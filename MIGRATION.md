# Migrasi naposo-kalender → Next.js

Devlog migrasi dari vanilla JS/GitHub Pages ke Next.js + Vercel, mengikuti pola
madael-web. Sumber lama tetap ada di branch `main` repo yang sama sampai
migrasi selesai dan siap di-merge.

## Sesi 1 — Skeleton (selesai)

- Setup Next.js 16 + React 19 + Tailwind v4, konvensi sama seperti madael-web
  (`lib/supabase.js`, `lib/supabase-browser.js`, `lib/supabase-admin.js`)
- Palet warna & font (`Libre Baskerville` + `DM Sans`) dipertahankan persis dari
  `css/index.css` lama lewat CSS variable di `app/globals.css`
- `ThemeContext` — pengganti `applyDark()` global lama, localStorage key sama
  (`naposo_theme` baru, sebelumnya cek langsung `data-theme`)
- Navbar + Footer di-port, termasuk logic `trackVisit()` (session 24 jam,
  counter "kunjungan bulan ini") persis dari `js/index.js`
- Homepage (`app/page.js`): banner (`home_announcement`), pengumuman aktif
  (`announcements`), event terdekat (`events`), dokumen (`home_docs`) — semua
  fetch langsung dari Supabase sebagai proof of concept
- Halaman `kalender`, `reversement`, `statistik` masih stub — logic lama di
  file tsb jauh lebih besar (877–2688 baris), menyusul satu-satu

### Perbaikan keamanan yang disertakan

1. **Token admin statis dihapus.** `ADMIN_SECRET = "naposo-admin-2026"` di
   `verify-login`/`db-write` (Edge Function lama) diganti JWT asli yang
   ditandatangani (`lib/adminAuth.js`, pakai `jose`), disimpan di httpOnly
   cookie, kedaluwarsa 12 jam. Login lewat `app/api/auth/login`, dicek tiap
   request ke `/admin/**` lewat `middleware.js`.
2. **`db-write` dipindah jadi Route Handler** (`app/api/admin/db-write`) yang
   memverifikasi JWT dari cookie, bukan header token statis.

### Masih harus dikerjakan manual di Supabase (belum bisa dari kode)

RLS di 4 tabel berikut saat ini mengizinkan tulis publik (siapa pun dengan
anon key bisa insert/update/delete langsung, tanpa lewat aplikasi sama
sekali). Begitu `app/api/admin/db-write` dipakai penuh dan Edge Function lama
(`db-write`, `verify-login`) sudah tidak dipakai lagi, jalankan ini di
Supabase SQL Editor:

```sql
drop policy if exists "write_anon" on categories;
create policy "write_categories_service_role" on categories
  for all using (auth.role() = 'service_role');

drop policy if exists "all write" on home_docs;
create policy "write_home_docs_service_role" on home_docs
  for all using (auth.role() = 'service_role');

drop policy if exists "all write" on home_visibility;
create policy "write_home_visibility_service_role" on home_visibility
  for all using (auth.role() = 'service_role');

drop policy if exists "write_reversement_posts" on reversement_posts;
create policy "write_reversement_posts_service_role" on reversement_posts
  for all using (auth.role() = 'service_role');
```

**Jangan jalankan ini sebelum halaman admin yang menulis ke tabel-tabel itu
sudah dipindah ke `app/api/admin/db-write`** — kalau dijalankan lebih awal,
fitur admin di situs lama (yang masih di GitHub Pages, masih pakai anon key
langsung) akan langsung berhenti bisa menulis.

## Sesi berikutnya (belum dikerjakan)

- Migrasi `kalender.html` → `app/kalender/page.js` (recurring events, filter
  kategori, admin CRUD)
- Migrasi `reversement.html` → `app/reversement/page.js` (pagination, search,
  reaction emoji)
- Migrasi `statistik.html` → `app/statistik/page.js` (KPI, filter, Chart.js) —
  perlu proteksi seperti `/admin`
- Recap gallery + Google Drive integration (`drive-gallery` Edge Function bisa
  tetap dipakai apa adanya, tidak ada masalah keamanan di situ)
- i18n EN/ID
- PWA (manifest, service worker)
- Setup Vercel + pindah domain `naposo.my.id`
