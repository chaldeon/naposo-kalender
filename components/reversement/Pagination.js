'use client';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) range.push(i);
    else if (range[range.length - 1] !== '…') range.push('…');
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="w-8 h-8 rounded-full text-sm disabled:opacity-30"
        style={{ color: 'var(--text2)' }}
      >
        ‹
      </button>
      {range.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="text-sm px-1" style={{ color: 'var(--text3)' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="w-8 h-8 rounded-full text-sm font-semibold"
            style={p === page ? { background: 'var(--blue)', color: '#fff' } : { color: 'var(--text2)' }}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="w-8 h-8 rounded-full text-sm disabled:opacity-30"
        style={{ color: 'var(--text2)' }}
      >
        ›
      </button>
    </div>
  );
}
