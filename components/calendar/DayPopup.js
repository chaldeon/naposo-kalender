'use client';

import { X } from 'lucide-react';
import { formatFullDate } from '@/lib/dates';

export default function DayPopup({ date, events, catColor, catLabel, onSelectEvent, onClose }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[70vh] flex flex-col"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {formatFullDate(date)}
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: 'var(--text3)' }} />
          </button>
        </div>
        <div className="p-3 overflow-y-auto flex flex-col gap-2">
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className="text-left rounded-xl border p-3 flex items-center gap-2.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor(ev.category) }} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                  {ev.title}
                </div>
                {ev.time && (
                  <div className="text-xs" style={{ color: 'var(--text3)' }}>
                    {ev.time}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
