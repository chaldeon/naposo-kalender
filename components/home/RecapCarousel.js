'use client';

function catLabelFallback(id) {
  const map = { ibadah: 'Ibadah', olahraga: 'Olahraga', 'event-gabungan': 'Event Gabungan', rapat: 'Rapat', lainnya: 'Lainnya' };
  return map[id] || id;
}

export default function RecapCarousel({ items, onOpen }) {
  if (!items.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
      {items.map((r) => {
        const meta = r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        return (
          <button
            key={r.id}
            onClick={() => onOpen(r)}
            className="relative shrink-0 w-56 h-32 rounded-2xl overflow-hidden text-left"
            style={{
              scrollSnapAlign: 'start',
              background: r.cover_url ? `url(${r.cover_url}) center/cover` : r.bg_color || '#1a2e5e',
            }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.1))' }} />
            <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
              <span className="text-[10px] font-bold tracking-wide opacity-80">• {catLabelFallback(r.category).toUpperCase()}</span>
              <div className="font-serif font-bold text-sm leading-tight truncate">{r.title}</div>
              <div className="flex items-center gap-2 text-[11px] opacity-80">
                <span>{meta}</span>
                {r.folder_id && <span>📷</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
