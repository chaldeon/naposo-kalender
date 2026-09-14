'use client';

export default function RecurScopeModal({ mode, onChooseOne, onChooseAll, onCancel }) {
  const verb = mode === 'delete' ? 'Hapus' : 'Simpan perubahan';
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onCancel}>
      <div className="w-full max-w-xs rounded-2xl p-5" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Event ini bagian dari rangkaian berulang
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
          {verb} untuk event ini saja, atau untuk semua event berulang mendatang di rangkaian ini?
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onChooseOne} className="text-xs font-semibold rounded-lg px-3 py-2 border text-left" style={{ borderColor: 'var(--border2)', color: 'var(--text)' }}>
            {verb} — hanya event ini
          </button>
          <button
            onClick={onChooseAll}
            className="text-xs font-semibold rounded-lg px-3 py-2 text-left"
            style={{ background: mode === 'delete' ? 'var(--red)' : 'var(--blue)', color: '#fff' }}
          >
            {verb} — ini &amp; semua yang akan datang
          </button>
          <button onClick={onCancel} className="text-xs font-semibold rounded-lg px-3 py-2 text-center" style={{ color: 'var(--text3)' }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
