'use client';

import { useState } from 'react';
import { X, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import { dbWrite } from '@/lib/dbWrite';

const BLANK = { title: '', category: 'ibadah', date: '', cover_url: '', bg_color: '#1a2e5e', folder_id: '', sort_order: '' };
const CATEGORIES = ['ibadah', 'olahraga', 'event-gabungan', 'rapat', 'lainnya'];

export default function RecapManagerModal({ recapItems, onClose, onChanged }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEdit(r) {
    setEditId(r.id);
    setForm({
      title: r.title || '',
      category: r.category || 'ibadah',
      date: r.date || '',
      cover_url: r.cover_url || '',
      bg_color: r.bg_color || '#1a2e5e',
      folder_id: r.folder_id || '',
      sort_order: r.sort_order != null ? String(r.sort_order) : '',
    });
  }

  function resetForm() {
    setEditId(null);
    setForm(BLANK);
    setError('');
  }

  async function save() {
    if (!form.title.trim() || !form.date) {
      setError('Judul dan tanggal wajib diisi.');
      return;
    }
    if (!editId && !form.folder_id.trim()) {
      setError('Folder ID Google Drive wajib diisi untuk recap baru.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      cover_url: form.cover_url.trim() || null,
      bg_color: form.bg_color || '#1a2e5e',
      folder_id: form.folder_id.trim() || null,
      sort_order: form.sort_order !== '' ? parseInt(form.sort_order) : 0,
      active: editId ? undefined : true,
    };
    if (payload.active === undefined) delete payload.active;
    try {
      if (editId) await dbWrite({ table: 'recap_items', method: 'UPDATE', data: payload, match: { id: editId } });
      else await dbWrite({ table: 'recap_items', method: 'INSERT', data: { ...payload, id: 'recap_' + Date.now() } });
      resetForm();
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r) {
    try {
      await dbWrite({ table: 'recap_items', method: 'UPDATE', data: { active: !r.active }, match: { id: r.id } });
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  async function remove(r) {
    if (!confirm(`Hapus recap "${r.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await dbWrite({ table: 'recap_items', method: 'DELETE', match: { id: r.id } });
      if (editId === r.id) resetForm();
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>Kelola Recap Galeri</h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text3)' }} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
          {recapItems.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text3)' }}>Belum ada recap.</p>
          )}
          {recapItems.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: 'var(--border)', opacity: r.active === false ? 0.55 : 1 }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.bg_color || '#1a2e5e' }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{r.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{r.date} · {r.category}</div>
              </div>
              <button onClick={() => toggleActive(r)} title={r.active === false ? 'Aktifkan' : 'Nonaktifkan'} style={{ color: 'var(--text3)' }}>
                {r.active === false ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => startEdit(r)} style={{ color: 'var(--text3)' }}><Pencil size={14} /></button>
              <button onClick={() => remove(r)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-bold" style={{ color: 'var(--text2)' }}>{editId ? 'Edit Recap' : 'Tambah Recap'}</div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Judul recap"
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }} />
          </div>
          <input
            value={form.folder_id}
            onChange={(e) => setForm((f) => ({ ...f, folder_id: e.target.value }))}
            placeholder="Folder ID Google Drive (wajib untuk recap baru)"
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <input
            value={form.cover_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
            placeholder="URL cover (opsional)"
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <div className="flex items-center gap-2">
            <input type="color" value={form.bg_color} onChange={(e) => setForm((f) => ({ ...f, bg_color: e.target.value }))} className="w-6 h-6 rounded" />
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              placeholder="Urutan"
              className="w-20 text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            />
            <div className="flex-1" />
            {editId && <button onClick={resetForm} className="text-xs font-semibold px-2" style={{ color: 'var(--text3)' }}>Batal</button>}
            <button onClick={save} disabled={saving} className="text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy disabled:opacity-60">
              {saving ? 'Menyimpan…' : editId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text3)' }}>
            Foto diambil otomatis dari folder Google Drive di atas — tidak perlu upload manual di sini.
          </p>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}