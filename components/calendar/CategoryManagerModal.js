'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { dbWrite } from '@/lib/dbWrite';

const BUILT_IN = ['koor', 'ibadah', 'rapat', 'latihan', 'reversement', 'doa', 'other'];

export default function CategoryManagerModal({ categories, onClose, onChanged }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    const id = 'cat_' + Date.now();
    setBusyId(id);
    setError('');
    try {
      await dbWrite({ table: 'categories', method: 'INSERT', data: { id, color: newColor, label_id: name, label_en: name } });
      setNewName('');
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function editColor(cat, color) {
    setBusyId(cat.id);
    try {
      await dbWrite({ table: 'categories', method: 'UPDATE', data: { color }, match: { id: cat.id } });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function editName(cat, name) {
    if (!name.trim()) return;
    setBusyId(cat.id);
    try {
      await dbWrite({ table: 'categories', method: 'UPDATE', data: { label_id: name, label_en: name }, match: { id: cat.id } });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeCategory(cat) {
    if (BUILT_IN.includes(cat.id)) return;
    if (!confirm('Hapus kategori "' + cat.label_id + '"? Event yang sudah memakai kategori ini tidak ikut terhapus.')) return;
    setBusyId(cat.id);
    try {
      await dbWrite({ table: 'categories', method: 'DELETE', match: { id: cat.id } });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[85vh] flex flex-col" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>Kelola Kategori</h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text3)' }} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
          {categories.map((cat) => {
            const isBuiltIn = BUILT_IN.includes(cat.id);
            return (
              <div key={cat.id} className="flex items-center gap-2 opacity-100" style={{ opacity: busyId === cat.id ? 0.5 : 1 }}>
                <input
                  type="color"
                  defaultValue={cat.color}
                  disabled={isBuiltIn}
                  onChange={(e) => editColor(cat, e.target.value)}
                  className="w-6 h-6 rounded shrink-0 disabled:opacity-50"
                />
                <input
                  defaultValue={cat.label_id}
                  disabled={isBuiltIn}
                  onBlur={(e) => !isBuiltIn && editName(cat, e.target.value)}
                  className="flex-1 text-xs rounded-lg border px-2 py-1 disabled:opacity-60"
                  style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
                />
                {isBuiltIn ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
                    Bawaan
                  </span>
                ) : (
                  <button onClick={() => removeCategory(cat)} className="shrink-0" style={{ color: 'var(--red)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
          <div className="flex items-center gap-2">
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-6 h-6 rounded shrink-0" />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori baru"
              className="flex-1 text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            />
            <button onClick={addCategory} className="text-xs font-semibold rounded-full px-3 py-1.5 bg-gold text-navy shrink-0">
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
