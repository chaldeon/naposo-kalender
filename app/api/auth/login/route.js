import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fungsi RPC check_admin_password sudah ada di database (pakai crypt/pgcrypto) — tetap dipakai.
  const { data: isValid, error } = await supabase.rpc('check_admin_password', {
    p_username: username,
    p_password: password,
  });

  if (error || !isValid) {
    return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
  }

  // Ganti token statis lama dengan JWT asli yang ditandatangani & punya masa berlaku.
  const token = await signAdminToken({ username });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 jam, samakan dengan EXPIRES_IN di lib/adminAuth.js
  });
  return res;
}
