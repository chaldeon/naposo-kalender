import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CalendarDays, FileText } from 'lucide-react';

async function getHomeData() {
  const [{ data: banner }, { data: announcements }, { data: events }, { data: docs }] = await Promise.all([
    supabase.from('home_announcement').select('*').eq('id', 'config').eq('active', true).maybeSingle(),
    supabase.from('announcements').select('*').eq('active', true).order('updated_at', { ascending: false }),
    supabase.from('events').select('*').eq('status', 'published').gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(5),
    supabase.from('home_docs').select('*').eq('active', true),
  ]);
  return { banner, announcements: announcements || [], events: events || [], docs: docs || [] };
}

export default async function HomePage() {
  const { banner, announcements, events, docs } = await getHomeData();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {banner && (
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--blue-mid) 100%)' }}
        >
          <div className="font-serif text-lg font-bold mb-1">{banner.title}</div>
          {banner.sub && <p className="text-sm opacity-90 mb-3">{banner.sub}</p>}
          {banner.link && banner.cta && (
            <Link
              href={banner.link}
              className="inline-block rounded-full bg-gold text-navy text-xs font-semibold px-4 py-1.5 no-underline"
            >
              {banner.cta}
            </Link>
          )}
        </div>
      )}

      {announcements.map((a) => (
        <div
          key={a.id}
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: a.color || 'var(--blue)', color: '#fff' }}
        >
          {a.text}
          {a.link && a.link_label && (
            <Link href={a.link} className="ml-2 underline font-semibold">
              {a.link_label}
            </Link>
          )}
        </div>
      ))}

      <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} style={{ color: 'var(--blue)' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Kegiatan Mendatang
          </h2>
        </div>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Belum ada kegiatan terjadwal.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <div
                  className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-center"
                  style={{ background: 'var(--sky-pale)', color: 'var(--blue)' }}
                >
                  {ev.date}
                </div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text)' }}>
                    {ev.title}
                  </div>
                  {ev.time && (
                    <div className="text-xs" style={{ color: 'var(--text3)' }}>
                      {ev.time}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link href="/kalender" className="inline-block mt-4 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
          Lihat kalender lengkap →
        </Link>
      </section>

      {docs.length > 0 && (
        <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: 'var(--blue)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Dokumen
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {docs.map((d) => (
              <li key={d.id}>
                <Link href={d.link} className="text-sm font-medium underline" style={{ color: 'var(--blue)' }}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
