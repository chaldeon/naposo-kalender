'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getExtraFields, GABUNGAN_CATS } from '@/lib/eventExtraFields';
import { RECUR_PATTERNS, recurDates } from '@/lib/recurrence';

const BLANK = {
  date: '',
  title: '',
  timeStart: '',
  timeEnd: '',
  category: '',
  note: '',
  thumbnail_url: '',
  featured: false,
  draft: false,
  extra: {},
  gabungan: false,
};

export default function EventFormModal({ categories, catLabel, initial, onClose, onSave, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(BLANK);
  const [recurPattern, setRecurPattern] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      const [ts, te] = (initial.time || '').split('–');
      setForm({
        date: initial.date,
        title: initial.title,
        timeStart: initial.time_start || ts || '',
        timeEnd: initial.time_end || te || '',
        category: initial.category,
        note: initial.note || '',
        thumbnail_url: initial.thumbnail_url || '',
        featured: !!initial.featured,
        draft: initial.status === 'draft',
        extra: initial.extra || {},
        gabungan: !!initial.extra?.gabungan,
      });
    } else {
      setForm({ ...BLANK, category: categories[0]?.id || '' });
    }
    setRecurPattern('');
  }, [initial, categories]);

  const label = catLabel(form.category);
  const extraFields = getExtraFields(label);
  const showGabungan = GABUNGAN_CATS.includes(form.category);
  const recurCount = !isEdit && recurPattern && form.date ? recurDates(form.date, recurPattern).length : 0;

  function setExtra(key, val) {
    setForm((f) => ({ ...f, extra: { ...f.extra, [key]: val } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.title.trim()) {
      setError('Tanggal dan judul wajib diisi.');
      return;
    }
    setError('');
    const time = form.timeStart ? (form.timeEnd ? `${form.timeStart}–${form.timeEnd}` : form.timeStart) : '';
    const extra = { ...form.extra };
    if (showGabungan && form.gabungan) extra.gabungan = true;
    else delete extra.gabungan;

    const payload = {
      date: form.date,
      title: form.title.trim(),
      time,
      time_start: form.timeStart || null,
      time_end: form.timeEnd || null,
      category: form.category,
      note: form.note.trim(),
      link: '',
      thumbnail_url: form.thumbnail_url.trim() || null,
      extra,
      featured: form.featured,
      status: form.draft ? 'draft' : 'published',
    };
    onSave(payload, recurPattern);
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>
            {isEdit ? 'Edit Event' : 'Tambah Event'}
          </h2>
          <button type="button" onClick={onClose}>
            <X size={18} style={{ color: 'var(--text3)' }} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal">
              <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input" />
            </Field>
            <Field label="Kategori">
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label_id}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Judul">
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jam Mulai">
              <input type="time" value={form.timeStart} onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))} className="input" />
            </Field>
            <Field label="Jam Selesai">
              <input type="time" value={form.timeEnd} onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))} className="input" />
            </Field>
          </div>

          {!isEdit && (
            <Field label="Pengulangan">
              <select value={recurPattern} onChange={(e) => setRecurPattern(e.target.value)} className="input">
                {RECUR_PATTERNS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              {recurPattern && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>
                  {recurCount > 0 ? `Akan membuat ${recurCount} instance tambahan sampai akhir kuartal.` : 'Tidak ada instance tambahan sampai akhir kuartal.'}
                </p>
              )}
            </Field>
          )}

          {showGabungan && (
            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.gabungan} onChange={(e) => setForm((f) => ({ ...f, gabungan: e.target.checked }))} />
              Event gabungan
            </label>
          )}

          {extraFields.filter((f) => !f.adminOnly || isEdit || true).map((f) => (
            <Field key={f.key} label={f.label}>
              {f.type === 'select' ? (
                <select value={form.extra[f.key] || ''} onChange={(e) => setExtra(f.key, e.target.value)} className="input">
                  <option value="">—</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === 'url' ? 'url' : 'text'}
                  value={form.extra[f.key] || ''}
                  onChange={(e) => setExtra(f.key, e.target.value)}
                  className="input"
                />
              )}
            </Field>
          ))}

          <Field label="Catatan">
            <textarea rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="input" />
          </Field>

          <Field label="URL Thumbnail (opsional)">
            <input value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} className="input" />
          </Field>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.draft} onChange={(e) => setForm((f) => ({ ...f, draft: e.target.checked }))} />
              Simpan sebagai draft
            </label>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="text-xs font-semibold rounded-full px-4 py-2 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            Batal
          </button>
          <button type="submit" disabled={saving} className="text-xs font-semibold rounded-full px-4 py-2 bg-gold text-navy disabled:opacity-60">
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            font-size: 13px;
            padding: 7px 10px;
            border-radius: 8px;
            border: 1px solid var(--border2);
            background: var(--surface);
            color: var(--text);
            outline: none;
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text2)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
