'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatFullDate } from '@/lib/dates';
import { getExtraFields } from '@/lib/eventExtraFields';
import { supabase } from '@/lib/supabase';
import { dbWrite } from '@/lib/dbWrite';

function buildGCalLink(ev) {
  const start = ev.date.replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${start}/${start}`,
    details: ev.note || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function driveToThumbnail(url) {
  const match = url?.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w400` : url;
}

export default function EventDetailModal({ event, catColor, catLabel, onClose, isAdmin, onEdit, onDelete, onExtend }) {
  const [tab, setTab] = useState('info');
  const [gallery, setGallery] = useState(null);
  const [galleryUrls, setGalleryUrls] = useState('');
  const [addingPhotos, setAddingPhotos] = useState(false);
  const [activityLog, setActivityLog] = useState(null);

  function reloadGallery() {
    supabase
      .from('event_gallery')
      .select('*')
      .eq('event_id', event.id)
      .order('order', { ascending: true })
      .then(({ data }) => setGallery(data || []));
  }

  async function addPhotos() {
    const urls = galleryUrls.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!urls.length) return;
    setAddingPhotos(true);
    try {
      for (let i = 0; i < urls.length; i++) {
        await dbWrite({ table: 'event_gallery', method: 'INSERT', data: { event_id: event.id, drive_url: urls[i], caption: '', order: 99 + i } });
      }
      setGalleryUrls('');
      reloadGallery();
    } catch (err) {
      alert('Gagal menambah foto: ' + err.message);
    } finally {
      setAddingPhotos(false);
    }
  }

  async function deletePhoto(id) {
    if (!confirm('Hapus foto ini?')) return;
    try {
      await dbWrite({ table: 'event_gallery', method: 'DELETE', match: { id } });
      reloadGallery();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  }

  useEffect(() => {
    setTab('info');
    setGallery(null);
    setGalleryUrls('');
    setActivityLog(null);
    supabase
      .from('event_gallery')
      .select('*')
      .eq('event_id', event.id)
      .order('order', { ascending: true })
      .then(({ data }) => setGallery(data || []));
  }, [event.id]);

  useEffect(() => {
    if (tab === 'log' && isAdmin && activityLog === null) {
      supabase
        .from('event_logs')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
        .limit(30)
        .then(({ data }) => setActivityLog(data || []));
    }
  }, [tab, isAdmin, event.id, activityLog]);

  if (!event) return null;

  const col = catColor(event.category);
  const extraFields = getExtraFields(catLabel(event.category)).filter((f) => !f.adminOnly);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>
            Detail Event
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: 'var(--text3)' }} />
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {['info', 'gallery', ...(isAdmin ? ['log'] : [])].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 text-xs font-bold py-2"
              style={{
                color: tab === t ? 'var(--blue)' : 'var(--text3)',
                borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent',
              }}
            >
              {t === 'info' ? 'Info' : t === 'gallery' ? 'Galeri' : 'Log'}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'info' ? (
            <div className="flex flex-col gap-2">
              {event.status === 'draft' && (
                <span
                  className="self-start text-[10px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full mb-1"
                  style={{ background: 'rgba(245,158,11,.15)', color: '#b45309', border: '1px solid rgba(245,158,11,.35)' }}
                >
                  📝 DRAFT
                </span>
              )}
              <div className="text-xs" style={{ color: 'var(--text3)' }}>
                {formatFullDate(event.date)}
              </div>
              <div className="font-serif font-bold text-lg" style={{ color: 'var(--text)' }}>
                {event.title}
              </div>
              {event.time && <div className="text-sm">⏰ {event.time}</div>}
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all" style={{ color: 'var(--blue)' }}>
                  🔗 {event.link}
                </a>
              )}
              {extraFields.map((f) => {
                const val = event.extra?.[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="text-sm">
                    <span style={{ color: 'var(--text2)' }}>📌 {f.label}: </span>
                    {f.type === 'url' ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--blue)' }}>
                        {val}
                      </a>
                    ) : (
                      <span className="font-semibold">{val}</span>
                    )}
                  </div>
                );
              })}
              {event.note && (
                <div className="text-sm whitespace-pre-line mt-1" style={{ color: 'var(--text)' }}>
                  {event.note}
                </div>
              )}
              <span
                className="self-start text-xs font-semibold rounded-full px-2.5 py-1 mt-2"
                style={{ background: col + '22', color: col }}
              >
                {catLabel(event.category)}
              </span>
              <a
                href={buildGCalLink(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-xs font-semibold rounded-full px-3 py-1.5 border mt-2"
                style={{ borderColor: 'rgba(59,130,246,.3)', color: 'var(--blue)' }}
              >
                + Tambah ke Google Calendar
              </a>
              {isAdmin && (
                <div className="flex gap-2 mt-2 pt-2 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => onEdit(event)}
                    className="text-xs font-semibold rounded-full px-3.5 py-1.5 border"
                    style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
                  >
                    ✏️ Edit
                  </button>
                  {event.recur_group_id && (
                    <button
                      onClick={() => onExtend(event)}
                      className="text-xs font-semibold rounded-full px-3.5 py-1.5 border"
                      style={{ borderColor: 'rgba(59,130,246,.3)', color: 'var(--blue)' }}
                    >
                      🔁 Perpanjang Rangkaian
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(event)}
                    className="text-xs font-semibold rounded-full px-3.5 py-1.5"
                    style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)' }}
                  >
                    🗑 Hapus
                  </button>
                </div>
              )}
            </div>
          ) : tab === 'gallery' ? (
            <div>
              {gallery === null ? (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>
                  Memuat…
                </p>
              ) : gallery.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text3)' }}>
                  Belum ada foto.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {gallery.map((g) => (
                    <div key={g.id} className="relative">
                      <a href={g.drive_url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={driveToThumbnail(g.drive_url)} alt={g.caption || ''} className="w-full aspect-[4/3] object-cover rounded-lg" />
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => deletePhoto(g.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                          style={{ background: 'rgba(0,0,0,.55)', color: '#fff' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="text-[11px] font-bold" style={{ color: 'var(--text3)' }}>
                    TAMBAH FOTO
                  </div>
                  <textarea
                    rows={3}
                    value={galleryUrls}
                    onChange={(e) => setGalleryUrls(e.target.value)}
                    placeholder="Link Google Drive foto… (bisa banyak, satu per baris)"
                    className="text-xs rounded-lg border p-2 resize-y"
                    style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
                  />
                  <button
                    onClick={addPhotos}
                    disabled={addingPhotos}
                    className="self-start text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy disabled:opacity-60"
                  >
                    {addingPhotos ? 'Menambahkan…' : '+ Tambah Foto'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {activityLog === null ? (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Memuat…</p>
              ) : activityLog.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text3)' }}>Belum ada aktivitas tercatat.</p>
              ) : (
                <div className="flex flex-col">
                  {activityLog.map((r) => {
                    const ts = new Date(r.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const actionLabel = { create: '➕ Dibuat', update: '✏️ Diubah', delete: '🗑 Dihapus' }[r.action] || r.action;
                    return (
                      <div key={r.id} className="py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{actionLabel}</span>
                          <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{r.admin_name || '—'} · {ts}</span>
                        </div>
                        {r.diff && typeof r.diff === 'object' && (
                          <div className="mt-1 text-[11px]" style={{ color: 'var(--text3)' }}>
                            {Object.entries(r.diff).map(([k, v]) => (
                              <div key={k}>
                                <span className="font-semibold" style={{ color: 'var(--text2)' }}>{k}</span>:{' '}
                                <span style={{ color: 'var(--red)', textDecoration: 'line-through' }}>{String(v.from ?? '—')}</span>{' → '}
                                <span style={{ color: 'var(--green, #16a34a)' }}>{String(v.to ?? '—')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
