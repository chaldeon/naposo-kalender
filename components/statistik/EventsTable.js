import { localDateStr, MONTHS_ID } from '@/lib/dates';

export default function EventsTable({ events, labels }) {
  const today = localDateStr();
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  function badge(ev) {
    if (ev.status === 'draft')
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.15)', color: '#b45309', border: '1px solid rgba(245,158,11,.3)' }}>
          Draft
        </span>
      );
    if (ev.date < today)
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,100,100,.1)', color: 'var(--text3)' }}>
          Selesai
        </span>
      );
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,.12)', color: '#059669', border: '1px solid rgba(16,185,129,.3)' }}>
        Mendatang
      </span>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Tanggal', 'Judul', 'Kategori', 'Status'].map((h) => (
              <th key={h} className="text-left font-bold py-1.5 px-2" style={{ color: 'var(--text3)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((ev) => {
            const d = new Date(ev.date + 'T00:00:00');
            return (
              <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-1.5 px-2" style={{ color: 'var(--text)' }}>
                  {d.getDate()} {MONTHS_ID[d.getMonth()].slice(0, 3)} {d.getFullYear()}
                </td>
                <td className="py-1.5 px-2 font-semibold" style={{ color: 'var(--text)' }}>
                  {ev.title}
                </td>
                <td className="py-1.5 px-2" style={{ color: 'var(--text2)' }}>
                  {labels[ev.category] || ev.category}
                </td>
                <td className="py-1.5 px-2">{badge(ev)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
