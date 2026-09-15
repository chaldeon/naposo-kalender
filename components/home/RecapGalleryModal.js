'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const BATCH = 48;

const CAT_LABELS = {
  id: { ibadah: 'Ibadah', olahraga: 'Olahraga', 'event-gabungan': 'Event Gabungan', rapat: 'Rapat', lainnya: 'Lainnya' },
  en: { ibadah: 'Worship', olahraga: 'Sports', 'event-gabungan': 'Combined Event', rapat: 'Meeting', lainnya: 'Other' },
};

function catLabelFallback(id, lang) {
  return CAT_LABELS[lang]?.[id] || CAT_LABELS.id[id] || id;
}

export default function RecapGalleryModal({ recap, onClose }) {
  const [tab, setTab] = useState('photo');
  const [files, setFiles] = useState(null);
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const sentinelRef = useRef(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    setFiles(null);
    setTab('photo');
    setVisibleCount(BATCH);
    if (!recap.folder_id) {
      setFiles([]);
      return;
    }
    fetch('/api/drive-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_id: recap.folder_id }),
    })
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []))
      .catch(() => setFiles([]));
  }, [recap.id, recap.folder_id]);

  const photos = (files || []).filter((f) => f.type === 'photo');
  const videos = (files || []).filter((f) => f.type === 'video');

  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= photos.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((v) => Math.min(v + BATCH, photos.length));
      },
      { rootMargin: '200px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [visibleCount, photos.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e) {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => Math.max(i - 1, 0));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxIdx, photos.length]);

  const meta = recap.date ? new Date(recap.date + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.6)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[88vh] flex flex-col" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div
          className="relative h-28 flex items-end p-4 text-white shrink-0"
          style={{ background: recap.cover_url ? `url(${recap.cover_url}) center/cover` : recap.bg_color || '#1a2e5e' }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.1))' }} />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,.4)' }}>
            <X size={16} />
          </button>
          <div className="relative">
            <span className="text-[10px] font-bold tracking-wide opacity-80">{catLabelFallback(recap.category, lang).toUpperCase()}</span>
            <div className="font-serif font-bold text-lg leading-tight">{recap.title}</div>
            <div className="text-xs opacity-80">
              {meta} {files !== null && `· ${photos.length} ${t('recap_photos')}${videos.length ? ' · ' + videos.length + ' ' + t('recap_videos') : ''}`}
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
            {['photo', 'video'].map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className="flex-1 text-xs font-bold py-2"
                style={{ color: tab === tabKey ? 'var(--blue)' : 'var(--text3)', borderBottom: tab === tabKey ? '2px solid var(--blue)' : '2px solid transparent' }}
              >
                {tabKey === 'photo' ? `${t('recap_tab_photo')} (${photos.length})` : `${t('recap_tab_video')} (${videos.length})`}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          {files === null ? (
            <p className="text-xs text-center py-10" style={{ color: 'var(--text3)' }}>{t('det_gallery_loading')}</p>
          ) : tab === 'photo' ? (
            photos.length === 0 ? (
              <p className="text-xs text-center py-10" style={{ color: 'var(--text3)' }}>
                {recap.folder_id ? t('recap_no_photos') : t('recap_folder_empty')}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {photos.slice(0, visibleCount).map((f, i) => (
                    <button key={f.id} onClick={() => setLightboxIdx(i)} title={f.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.thumbnail} alt={f.name} loading="lazy" className="w-full aspect-square object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </button>
                  ))}
                </div>
                {visibleCount < photos.length && <div ref={sentinelRef} className="h-4" />}
              </>
            )
          ) : videos.length === 0 ? (
            <p className="text-xs text-center py-10" style={{ color: 'var(--text3)' }}>{t('recap_no_videos')}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {videos.map((f) => (
                <a key={f.id} href={f.driveLink} target="_blank" rel="noopener noreferrer" className="relative rounded-lg overflow-hidden" title={f.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.thumbnail} alt={f.name} loading="lazy" className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xl" style={{ background: 'rgba(0,0,0,.25)' }}>▶</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.92)' }} onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }} className="absolute top-4 right-4 text-white"><X size={22} /></button>
          {lightboxIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i - 1); }} className="absolute left-2 sm:left-6 text-white"><ChevronLeft size={28} /></button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i + 1); }} className="absolute right-2 sm:right-6 text-white"><ChevronRight size={28} /></button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://lh3.googleusercontent.com/d/${photos[lightboxIdx].id}`}
            alt={photos[lightboxIdx].name}
            className="max-h-[80vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-3 flex items-center gap-3 text-white text-xs" onClick={(e) => e.stopPropagation()}>
            <span>{photos[lightboxIdx].name} · {lightboxIdx + 1}/{photos.length}</span>
            <a href={photos[lightboxIdx].driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline">
              <ExternalLink size={12} /> {t('recap_open_drive')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
