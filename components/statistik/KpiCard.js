export default function KpiCard({ label, value }) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-1" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      <div className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text3)' }}>
        {label}
      </div>
    </div>
  );
}
