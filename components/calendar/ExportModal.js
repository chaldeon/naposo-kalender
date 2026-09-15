'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { MONTHS_ID, MONTHS_EN } from '@/lib/dates';
import { useLanguage } from '@/context/LanguageContext';

export default function ExportModal({ currentMonth, hasCategoryFilter, onClose, onExport }) {
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('month');
  const [monthFrom, setMonthFrom] = useState(currentMonth);
  const [monthTo, setMonthTo] = useState(currentMonth);
  const { t, lang } = useLanguage();
  const MO = lang === 'en' ? MONTHS_EN : MONTHS_ID;

  function handleExport() {
    onExport({ format, scope, monthFrom, monthTo });
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.55)' }} onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl overflow-hidden" style={{ background: 'var(--surface)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-serif font-bold text-base" style={{ color: 'var(--text)' }}>{t('export_title')}</h2>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text3)' }} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>{t('export_format')}</div>
            <div className="flex gap-2">
              {[
                { id: 'csv', label: 'CSV' },
                { id: 'ical', label: 'iCal' },
                { id: 'pdf', label: 'PDF' },
                { id: 'png', label: 'PNG' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="flex-1 text-xs font-semibold rounded-lg py-1.5 border"
                  style={format === f.id ? { background: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' } : { borderColor: 'var(--border2)', color: 'var(--text2)' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {format !== 'png' && (
          <div>
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>{t('export_scope')}</div>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text)' }}>
                <input type="radio" checked={scope === 'month'} onChange={() => setScope('month')} /> {t('export_scope_month')} ({MO[currentMonth]})
              </label>
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text)' }}>
                <input type="radio" checked={scope === 'pick'} onChange={() => setScope('pick')} /> {t('export_scope_pick')}
              </label>
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text)' }}>
                <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} /> {t('export_scope_all')}
              </label>
              {hasCategoryFilter && (
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text)' }}>
                  <input type="radio" checked={scope === 'cat'} onChange={() => setScope('cat')} /> {t('export_scope_cat')}
                </label>
              )}
            </div>
            {scope === 'pick' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <select value={monthFrom} onChange={(e) => setMonthFrom(parseInt(e.target.value))} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
                  {MO.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={monthTo} onChange={(e) => setMonthTo(parseInt(e.target.value))} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
                  {MO.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
          )}
          {format === 'png' && (
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {t('export_png_note')} ({MO[currentMonth]}).
            </p>
          )}

          <button onClick={handleExport} className="text-xs font-semibold rounded-full px-4 py-2 bg-gold text-navy">
            {t('export_download')}
          </button>
        </div>
      </div>
    </div>
  );
}
