import { createClient } from '@supabase/supabase-js';

// PERINGATAN: client ini bypass semua RLS policy lewat service role key.
// HANYA boleh diimport di server: Route Handler (app/api/**) atau Server Action.
// Jangan pernah import file ini di komponen client ('use client').
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
