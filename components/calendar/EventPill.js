'use client';

const BUILT_IN = ['koor', 'ibadah', 'rapat', 'latihan', 'reversement', 'doa', 'other'];

export default function EventPill({ event, color, onClick }) {
  const isCustomCat = !BUILT_IN.includes(event.category);
  return (
    <button
      onClick={() => onClick(event)}
      className="flex items-center gap-1 w-full text-left rounded px-1.5 py-0.5 text-[11px] leading-tight truncate hover:opacity-80 transition-opacity"
      style={
        isCustomCat
          ? { background: color + '22', color }
          : { background: 'var(--surface2)', color: 'var(--text)' }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="truncate">{event.title}</span>
    </button>
  );
}
