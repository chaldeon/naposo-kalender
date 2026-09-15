'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, Megaphone, Settings, Images } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AnnouncementManagerModal from '@/components/home/AnnouncementManagerModal';
import DocManagerModal from '@/components/home/DocManagerModal';
import RecapManagerModal from '@/components/home/RecapManagerModal';
import RecapCarousel from '@/components/home/RecapCarousel';
import RecapGalleryModal from '@/components/home/RecapGalleryModal';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const [session, setSession] = useState({ loggedIn: false });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [docs, setDocs] = useState([]);
  const [recapItems, setRecapItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annMgrOpen, setAnnMgrOpen] = useState(false);
  const [docMgrOpen, setDocMgrOpen] = useState(false);
  const [recapMgrOpen, setRecapMgrOpen] = useState(false);
  const [openRecap, setOpenRecap] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setSession).catch(() => {});
    load();
  }, []);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: ann }, { data: evs }, { data: allDocs }, { data: recap }] = await Promise.all([
      supabase.from('announcements').select('*').order('updated_at', { ascending: false }),
      supabase.from('events').select('*').eq('status', 'published').gte('date', today).order('date').limit(5),
      supabase.from('home_docs').select('*'),
      supabase.from('recap_items').select('*').order('sort_order', { ascending: true }),
    ]);
    setAnnouncements(ann || []);
    setEvents(evs || []);
    setDocs(allDocs || []);
    setRecapItems(recap || []);
    setLoading(false);
  }

  const isAdmin = session.loggedIn;
  const activeAnnouncements = isAdmin ? announcements : announcements.filter((a) => a.active);
  // Publik selalu boleh lihat kategori 'publik' yang aktif; kategori 'pengurus' hanya untuk admin — sama seperti logic renderDocs() lama.
  const visibleDocs = docs.filter((d) => (d.active !== false || isAdmin) && (d.category === 'publik' || (isAdmin && d.category === 'pengurus')));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {isAdmin && (
        <div className="flex gap-2 justify-end">
          <button onClick={() => setAnnMgrOpen(true)} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            <Megaphone size={13} /> {t('home_announcements_manage')}
          </button>
          <button onClick={() => setDocMgrOpen(true)} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            <Settings size={13} /> {t('home_docs_manage')}
          </button>
          <button onClick={() => setRecapMgrOpen(true)} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            <Images size={13} /> {t('home_recap_manage')}
          </button>
        </div>
      )}

      {activeAnnouncements.map((a) => (
        <div
          key={a.id}
          className="rounded-xl px-4 py-3 text-sm relative"
          style={{ background: a.color || 'var(--blue)', color: '#fff', opacity: a.active ? 1 : 0.5 }}
        >
          {!a.active && (
            <span className="absolute top-1.5 right-2 text-[9px] font-bold bg-black/20 px-1.5 py-0.5 rounded-full">{t('home_inactive_badge')}</span>
          )}
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
            {t('home_upcoming_events')}
          </h2>
        </div>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>{t('home_loading')}</p>
        ) : events.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            {t('home_no_events')}
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
          {t('home_view_full_calendar')}
        </Link>
      </section>

      {recapItems.filter((r) => r.active !== false).length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Images size={16} style={{ color: 'var(--blue)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {t('home_recap_title')}
            </h2>
          </div>
          <RecapCarousel items={recapItems.filter((r) => r.active !== false)} onOpen={setOpenRecap} />
        </section>
      )}

      {visibleDocs.length > 0 && (
        <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: 'var(--blue)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {t('home_docs_title')}
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {visibleDocs.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <Link href={d.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline" style={{ color: 'var(--blue)' }}>
                  {d.title}
                </Link>
                {d.category === 'pengurus' && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
                    {t('home_docs_pengurus_badge')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {annMgrOpen && <AnnouncementManagerModal announcements={announcements} onClose={() => setAnnMgrOpen(false)} onChanged={load} />}
      {docMgrOpen && <DocManagerModal docs={docs} onClose={() => setDocMgrOpen(false)} onChanged={load} />}
      {recapMgrOpen && <RecapManagerModal recapItems={recapItems} onClose={() => setRecapMgrOpen(false)} onChanged={load} />}
      {openRecap && <RecapGalleryModal recap={openRecap} onClose={() => setOpenRecap(null)} />}
    </div>
  );
}
