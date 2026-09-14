'use client';

import EventPill from './EventPill';
import { localDateStr, DAYS_ID } from '@/lib/dates';

const MAX_VISIBLE = 3;

export default function MonthGrid({ year, month, events, catColor, onSelectEvent, onShowMore }) {
  const rawFirst = new Date(year, month, 1).getDay();
  const first = rawFirst === 0 ? 6 : rawFirst - 1; // Senin = kolom pertama
  const total = new Date(year, month + 1, 0).getDate();
  const today = localDateStr();

  const cells = [];
  for (let i = 0; i < first; i++) {
    cells.push(<div key={`empty-${i}`} className="min-h-[86px] border-r border-b" style={{ borderColor: 'var(--border)' }} />);
  }

  for (let d = 1; d <= total; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month, d).getDay();
    const isToday = ds === today;
    const dayEvents = events.filter((ev) => ev.date === ds);
    const visible = dayEvents.slice(0, MAX_VISIBLE);
    const hiddenCount = dayEvents.length - visible.length;

    cells.push(
      <div
        key={ds}
        className="min-h-[86px] border-r border-b p-1 flex flex-col gap-0.5"
        style={{
          borderColor: 'var(--border)',
          background: isToday ? 'var(--sky-pale)' : dow === 0 ? 'rgba(220,38,38,.03)' : 'transparent',
        }}
      >
        <div
          className="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
          style={isToday ? { background: 'var(--blue)', color: '#fff' } : { color: dow === 0 ? 'var(--red)' : 'var(--text2)' }}
        >
          {d}
        </div>
        {visible.map((ev) => (
          <EventPill key={ev.id} event={ev} color={catColor(ev.category)} onClick={onSelectEvent} />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => onShowMore(ds, dayEvents)}
            className="text-[10px] font-semibold text-left px-1"
            style={{ color: 'var(--text3)' }}
          >
            +{hiddenCount} lainnya
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-7" style={{ background: 'var(--surface2)' }}>
        {DAYS_ID.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold py-2" style={{ color: 'var(--text2)' }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ background: 'var(--surface)' }}>
        {cells}
      </div>
    </div>
  );
}
