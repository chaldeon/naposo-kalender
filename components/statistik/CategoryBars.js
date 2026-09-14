export default function CategoryBars({ counts, labels, colors }) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  if (!sorted.length) {
    return (
      <p className="text-sm" style={{ color: 'var(--text3)' }}>
        Belum ada data.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(([cat, count]) => (
        <div key={cat} className="flex items-center gap-2">
          <div className="w-28 shrink-0 text-xs truncate" style={{ color: 'var(--text2)' }}>
            {labels[cat] || cat}
          </div>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((count / max) * 100)}%`, background: colors[cat] || '#94a3b8' }} />
          </div>
          <div className="w-7 text-right text-xs" style={{ color: 'var(--text3)' }}>
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}
