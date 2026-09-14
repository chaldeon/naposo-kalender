'use client';

import { useEffect, useState } from 'react';

export default function UndoToast({ message, onUndo, onDismiss, seconds = 6 }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onDismiss();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDismiss]);

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[700] flex items-center gap-3 rounded-full px-4 py-2.5 shadow-lg"
      style={{ background: 'var(--navy)', color: '#fff' }}
    >
      <span className="text-xs">{message}</span>
      <button
        onClick={() => {
          onUndo();
          onDismiss();
        }}
        className="text-xs font-bold"
        style={{ color: 'var(--gold)' }}
      >
        URUNGKAN ({left})
      </button>
    </div>
  );
}
