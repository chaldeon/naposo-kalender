'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const LS_KEY = 'naposo_sid';
const LS_EXP = 'naposo_sid_exp';

export default function Footer() {
  const [visits, setVisits] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    trackVisit().then(setVisits);
  }, []);

  async function trackVisit() {
    try {
      const now = Date.now();
      const exp = parseInt(localStorage.getItem(LS_EXP) || '0', 10);
      let sid = localStorage.getItem(LS_KEY);

      // Sesi baru tiap 24 jam — sama seperti logic asli di js/index.js
      if (!sid || now > exp) {
        sid = `s_${now}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(LS_KEY, sid);
        localStorage.setItem(LS_EXP, String(now + 86400000));
        await supabase.from('visits').insert({ session_id: sid });
      }

      const d = new Date();
      const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const { count } = await supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      return count ?? 0;
    } catch {
      return null;
    }
  }

  return (
    <footer
      className="flex items-center justify-center gap-2 py-4 text-xs"
      style={{ color: 'var(--text3)', borderTop: '1px solid var(--border)' }}
    >
      <strong>Naposo HKBP Ujung Menteng</strong>
      <span>· © {year}</span>
      <span>· 👁 {visits ?? '–'} kunjungan bulan ini</span>
    </footer>
  );
}
