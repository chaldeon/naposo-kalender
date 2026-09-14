'use client';

import { formatFullDate } from '@/lib/dates';

export default function AgendaView({ events, catColor, catLabel, onSelectEvent, monthLabel, onPrevMonth, onNextMonth }) {
  if (!events.length) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-2">📭</div>
        <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Belum ada kegiatan bulan ini
        </div>
        <div className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          Coba lihat bulan lain
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={onPrevMonth} className="text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)' }}>
            ← Bulan lalu
          </button>
          <button onClick={onNextMonth} className="text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)' }}>
            Bulan depan →
          </button>
        </div>
      </div>
    );
  }

  const byDate = {};
  for (const ev of events) {
    (byDate[ev.date] ||= []).push(ev);
  }
  const dates = Object.keys(byDate).sort();

  return (
    <div className="flex flex-col gap-5">
      {dates.map((ds) => (
        <div key={ds}>
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--text2)' }}>
            {formatFullDate(ds)}
          </div>
          <div className="flex flex-col gap-2">
            {byDate[ds].map((ev) => (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="text-left rounded-xl border p-3 flex items-start gap-3 hover:shadow-sm transition-shadow"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: catColor(ev.category) }} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                    {ev.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                    {ev.time && <span>⏰ {ev.time}</span>}
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: catColor(ev.category) + '22', color: catColor(ev.category) }}
                    >
                      {catLabel(ev.category)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
