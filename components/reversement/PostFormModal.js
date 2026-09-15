'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const BLANK = {
  title: '',
  series_name: 'Reversement',
  day_type: 'senin',
  date: new Date().toISOString().slice(0, 10),
  verse_ref: '',
  poster_url: '',
  excerpt: '',
  body: '',
  published: true,
};

function generatePostId(date) {
  return date ? `rev-${date}` : `rev-${Date.now()}`;
}

export default function PostFormModal({ initial, onClose, onSave, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        series_name: initial.series_name || 'Reversement',
        day_type: initial.day_type || 'senin',
        date: initial.date || '',
        verse_ref: initial.verse_ref || '',
        poster_url: initial.poster_url || '',
        excerpt: initial.excerpt || '',
        body: initial.body || '',
        published: initial.published !== false,
      });
    } else {
      setForm(BLANK);
    }
    setError('');
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      setError(t('revform_error_required'));
      return;
    }
    const payload = {
      title: form.title.trim(),
      series_name: form.series_name.trim() || 'Reversement',
      day_type: form.day_type,
      date: form.date,
      verse_ref: form.verse_ref.trim() || null,
      poster_url: form.poster_url.trim() || null,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || null,
      published: form.published,
    };
    const id = isEdit ? initial.id : generatePostId(form.date);
    onSave(payload, id, isEdit);
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>
            {isEdit ? t('revform_edit_title') : t('revform_add_title')}
          </h2>
          <button type="button" onClick={onClose}>
            <X size={18} style={{ color: 'var(--text3)' }} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          <Field label={t('revform_title')}>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('revform_day')}>
              <select value={form.day_type} onChange={(e) => setForm((f) => ({ ...f, day_type: e.target.value }))} className="input">
                <option value="senin">{t('rev_day_senin')}</option>
                <option value="jumat">{t('rev_day_jumat')}</option>
              </select>
            </Field>
            <Field label={t('revform_date')}>
              <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input" />
            </Field>
          </div>

          <Field label={t('revform_series')}>
            <input value={form.series_name} onChange={(e) => setForm((f) => ({ ...f, series_name: e.target.value }))} className="input" />
          </Field>

          <Field label={t('revform_verse')}>
            <input value={form.verse_ref} onChange={(e) => setForm((f) => ({ ...f, verse_ref: e.target.value }))} className="input" placeholder={t('revform_verse_placeholder')} />
          </Field>

          <Field label={t('revform_poster')}>
            <input value={form.poster_url} onChange={(e) => setForm((f) => ({ ...f, poster_url: e.target.value }))} className="input" />
          </Field>

          <Field label={t('revform_excerpt')}>
            <textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="input" />
          </Field>

          <Field label={t('revform_body')}>
            <textarea rows={8} required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="input" />
          </Field>

          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            {t('revform_publish')}
          </label>

          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="text-xs font-semibold rounded-full px-4 py-2 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            {t('form_cancel')}
          </button>
          <button type="submit" disabled={saving} className="text-xs font-semibold rounded-full px-4 py-2 bg-gold text-navy disabled:opacity-60">
            {saving ? t('form_saving') : t('form_save')}
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
            font-family: inherit;
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
