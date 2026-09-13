import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase-admin';

// Sama seperti Edge Function db-write lama, tapi:
// - otorisasi lewat JWT httpOnly cookie yang diverifikasi tanda tangannya (bukan string statis)
// - dipakai bersamaan dengan perbaikan RLS: categories/home_docs/home_visibility/
//   reversement_posts harus diubah jadi service_role-only, karena setelah ini SEMUA
//   tulis untuk tabel tsb wajib lewat sini, tidak lagi bisa langsung dari anon key.
const ALLOWED_TABLES = [
  'events',
  'categories',
  'announcements',
  'event_gallery',
  'event_logs',
  'home_docs',
  'home_visibility',
  'recap_items',
  'reversement_posts',
];

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table, method, match, data, log } = await req.json();

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
  }

  const supabase = createAdminClient();
  let result, error;

  if (method === 'INSERT') {
    const payload = Array.isArray(data) ? data : [data];
    ({ data: result, error } = await supabase.from(table).insert(payload).select());
  } else if (method === 'UPDATE') {
    ({ data: result, error } = await supabase.from(table).update(data).match(match).select());
  } else if (method === 'DELETE') {
    ({ data: result, error } = await supabase.from(table).delete().match(match).select());
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (log && table === 'events' && log.event_id) {
    await supabase.from('event_logs').insert({
      event_id: log.event_id,
      admin_name: log.admin_name || session.sub || '—',
      action: log.action,
      diff: log.diff || null,
    });
  }

  return NextResponse.json({ data: result });
}
