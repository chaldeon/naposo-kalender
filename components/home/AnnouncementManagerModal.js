'use client';

import { useState } from 'react';
import { X, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import { dbWrite } from '@/lib/dbWrite';

const BLANK = { text: '', color: '#1e5ac8', link: '', link_label: '', active: true };

export default function AnnouncementManagerModal({ announcements, onClose, onChanged }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEdit(a) {
    setEditId(a.id);
    setForm({ text: a.text || '', color: a.color || '#1e5ac8', link: a.link || '', link_label: a.link_label || '', active: !!a.active });
  }

  function resetForm() {
    setEditId(null);
    setForm(BLANK);
    setError('');
  }

  async function save() {
    if (!form.text.trim()) {
      setError('Teks banner wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      text: form.text.trim(),
      color: form.color || '#1e5ac8',
      link: form.link.trim() || null,
      link_label: form.link_label.trim() || null,
      active: form.active,
      updated_at: new Date().toISOString(),
    };
    try {
      if (editId) await dbWrite({ table: 'announcements', method: 'UPDATE', data: payload, match: { id: editId } });
      else await dbWrite({ table: 'announcements', method: 'INSERT', data: payload });
      resetForm();
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(a) {
    try {
      await dbWrite({ table: 'announcements', method: 'UPDATE', data: { active: !a.active }, match: { id: a.id } });
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  async function remove(a) {
    if (!confirm('Hapus banner ini?')) return;
    try {
      await dbWrite({ table: 'announcements', method: 'DELETE', match: { id: a.id } });
      if (editId === a.id) resetForm();
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[85vh] flex flex-col" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>Kelola Pengumuman</h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text3)' }} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
          {announcements.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text3)' }}>Belum ada pengumuman.</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color || '#1e5ac8' }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{a.text}</div>
                <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{a.active ? 'Aktif' : 'Nonaktif'}</div>
              </div>
              <button onClick={() => toggleActive(a)} title={a.active ? 'Nonaktifkan' : 'Aktifkan'} style={{ color: 'var(--text3)' }}>
                {a.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => startEdit(a)} style={{ color: 'var(--text3)' }}><Pencil size={14} /></button>
              <button onClick={() => remove(a)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-bold" style={{ color: 'var(--text2)' }}>{editId ? 'Edit Banner' : 'Tambah Banner'}</div>
          <input
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Teks pengumuman"
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="Link (opsional)"
              className="text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            />
            <input
              value={form.link_label}
              onChange={(e) => setForm((f) => ({ ...f, link_label: e.target.value }))}
              placeholder="Label link"
              className="text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-6 h-6 rounded" />
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Aktif
            </label>
            <div className="flex-1" />
            {editId && (
              <button onClick={resetForm} className="text-xs font-semibold px-2" style={{ color: 'var(--text3)' }}>Batal</button>
            )}
            <button onClick={save} disabled={saving} className="text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy disabled:opacity-60">
              {saving ? 'Menyimpan…' : editId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
