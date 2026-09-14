'use client';

import { useState, useRef, useEffect } from 'react';
import { ListFilter, ChevronDown } from 'lucide-react';

export default function CategoryFilter({ categories, activeCats, onToggle, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const label = activeCats.size === 0 ? 'Semua Kategori' : `${activeCats.size} kategori dipilih`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border"
        style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'var(--surface)' }}
      >
        <ListFilter size={12} />
        {label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1.5 w-56 rounded-xl border shadow-lg z-50 p-2 flex flex-col gap-0.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <button
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="text-left text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-black/5"
            style={{ color: 'var(--blue)' }}
          >
            ✕ Reset filter
          </button>
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 text-xs"
              style={{ color: 'var(--text)' }}
            >
              <input type="checkbox" checked={activeCats.has(c.id)} onChange={() => onToggle(c.id)} />
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
              {c.label_id}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
