'use client';

import { useState } from 'react';
import { X, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import { dbWrite } from '@/lib/dbWrite';
import { useLanguage } from '@/context/LanguageContext';

const BLANK = { title: '', link: '', category: 'publik', active: true };

export default function DocManagerModal({ docs, onClose, onChanged }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  function startEdit(d) {
    setEditId(d.id);
    setForm({ title: d.title || '', link: d.link || '', category: d.category || 'publik', active: d.active !== false });
  }

  function resetForm() {
    setEditId(null);
    setForm(BLANK);
    setError('');
  }

  async function save() {
    if (!form.title.trim() || !form.link.trim()) {
      setError(t('docmgr_error_required'));
      return;
    }
    setSaving(true);
    setError('');
    const payload = { title: form.title.trim(), link: form.link.trim(), category: form.category, active: form.active };
    try {
      if (editId) await dbWrite({ table: 'home_docs', method: 'UPDATE', data: payload, match: { id: editId } });
      else await dbWrite({ table: 'home_docs', method: 'INSERT', data: { ...payload, id: 'doc_' + Date.now() } });
      resetForm();
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d) {
    try {
      await dbWrite({ table: 'home_docs', method: 'UPDATE', data: { active: d.active === false }, match: { id: d.id } });
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  async function remove(d) {
    if (!confirm(`${t('docmgr_delete_confirm')} "${d.title}"?`)) return;
    try {
      await dbWrite({ table: 'home_docs', method: 'DELETE', match: { id: d.id } });
      if (editId === d.id) resetForm();
      onChanged();
    } catch (err) {
      alert('Gagal: ' + err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[85vh] flex flex-col" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>{t('docmgr_title')}</h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text3)' }} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
          {docs.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text3)' }}>{t('docmgr_empty')}</p>
          )}
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: 'var(--border)', opacity: d.active === false ? 0.55 : 1 }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{d.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{d.category === 'pengurus' ? t('docmgr_committee') : t('docmgr_public')}</div>
              </div>
              <button onClick={() => toggleActive(d)} title={d.active === false ? t('annmgr_status_active') : t('annmgr_status_inactive')} style={{ color: 'var(--text3)' }}>
                {d.active === false ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => startEdit(d)} style={{ color: 'var(--text3)' }}><Pencil size={14} /></button>
              <button onClick={() => remove(d)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-bold" style={{ color: 'var(--text2)' }}>{editId ? t('docmgr_edit_title') : t('docmgr_add_title')}</div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('docmgr_name_placeholder')}
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <input
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder={t('docmgr_link_placeholder')}
            className="text-xs rounded-lg border px-2 py-1.5"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <div className="flex items-center gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="text-xs rounded-lg border px-2 py-1.5"
              style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            >
              <option value="publik">{t('docmgr_cat_public')}</option>
              <option value="pengurus">{t('docmgr_cat_committee')}</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              {t('docmgr_active_label')}
            </label>
            <div className="flex-1" />
            {editId && (
              <button onClick={resetForm} className="text-xs font-semibold px-2" style={{ color: 'var(--text3)' }}>{t('annmgr_cancel')}</button>
            )}
            <button onClick={save} disabled={saving} className="text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy disabled:opacity-60">
              {saving ? t('annmgr_saving') : editId ? t('annmgr_save') : t('annmgr_add')}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
