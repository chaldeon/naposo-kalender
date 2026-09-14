'use client';

export default function ConfirmModal({ message, confirmLabel = 'Ya', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onCancel}>
      <div className="w-full max-w-xs rounded-2xl p-5" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-xs font-semibold rounded-full px-3.5 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            Batal
          </button>
          <button onClick={onConfirm} className="text-xs font-semibold rounded-full px-3.5 py-1.5" style={{ background: 'var(--red)', color: '#fff' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
