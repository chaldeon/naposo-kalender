'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Grid3x3, List, Plus, Settings, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MONTHS_ID } from '@/lib/dates';
import { dbWrite } from '@/lib/dbWrite';
import { recurDates, computeExtension } from '@/lib/recurrence';
import MonthGrid from '@/components/calendar/MonthGrid';
import AgendaView from '@/components/calendar/AgendaView';
import CategoryFilter from '@/components/calendar/CategoryFilter';
import EventDetailModal from '@/components/calendar/EventDetailModal';
import DayPopup from '@/components/calendar/DayPopup';
import EventFormModal from '@/components/calendar/EventFormModal';
import ConfirmModal from '@/components/calendar/ConfirmModal';
import RecurScopeModal from '@/components/calendar/RecurScopeModal';
import CategoryManagerModal from '@/components/calendar/CategoryManagerModal';
import ExportModal from '@/components/calendar/ExportModal';
import UndoToast from '@/components/UndoToast';
import { exportCSV, exportICal, exportPDF, exportPNG } from '@/lib/exportCalendar';

const DEF_COLOR = '#94a3b8';

export default function KalenderPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState('grid');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCats, setActiveCats] = useState(new Set());
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayPopup, setDayPopup] = useState(null);
  const [session, setSession] = useState({ loggedIn: false });

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [recurScope, setRecurScope] = useState(null);
  const [catMgrOpen, setCatMgrOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const calWrapRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    load();
    fetch('/api/auth/me').then((r) => r.json()).then(setSession).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: evs, error: evErr }, { data: cats }] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    ]);
    if (evErr) setError(evErr.message);
    setEvents(evs || []);
    setCategories(cats || []);
    setLoading(false);
  }

  const catColor = (id) => categories.find((c) => c.id === id)?.color || DEF_COLOR;
  const catLabel = (id) => categories.find((c) => c.id === id)?.label_id || id;

  const filteredEvents = useMemo(() => {
    let list = session.loggedIn ? events : events.filter((e) => e.status !== 'draft');
    if (activeCats.size > 0) list = list.filter((e) => activeCats.has(e.category));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || (e.note || '').toLowerCase().includes(q));
    }
    return list;
  }, [events, activeCats, query, session.loggedIn]);

  const monthEvents = useMemo(() => {
    const prefix = year + '-' + String(month + 1).padStart(2, '0');
    return filteredEvents.filter((e) => e.date.startsWith(prefix));
  }, [filteredEvents, year, month]);

  function switchMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  function toggleCat(id) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAddForm() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEditForm(ev) {
    setSelectedEvent(null);
    setEditingEvent(ev);
    setFormOpen(true);
  }

  async function handleSave(payload, recurPattern) {
    if (editingEvent && editingEvent.recur_group_id) {
      setRecurScope({ mode: 'edit', event: editingEvent, payload });
      return;
    }
    await doSave(payload, recurPattern, 'one');
  }

  async function doSave(payload, recurPattern, scope) {
    setSaving(true);
    try {
      if (editingEvent) {
        const prev = editingEvent;
        const diff = {};
        ['date', 'title', 'time', 'category', 'note', 'status', 'featured'].forEach((k) => {
          if (String(prev[k] ?? '') !== String(payload[k] ?? '')) diff[k] = { from: prev[k], to: payload[k] };
        });
        await dbWrite({
          table: 'events',
          method: 'UPDATE',
          data: payload,
          match: { id: prev.id },
          log: { event_id: prev.id, action: 'update', diff: Object.keys(diff).length ? diff : null },
        });

        if (scope === 'all' && prev.recur_group_id) {
          const todayStr = new Date().toISOString().slice(0, 10);
          const siblings = events.filter((e) => e.recur_group_id === prev.recur_group_id && e.id !== prev.id && e.date >= todayStr);
          const shared = { title: payload.title, time: payload.time, category: payload.category, note: payload.note, extra: payload.extra, status: payload.status };
          for (const sib of siblings) {
            await dbWrite({ table: 'events', method: 'UPDATE', data: shared, match: { id: sib.id } });
          }
        }
      } else {
        const [inserted] = await dbWrite({
          table: 'events',
          method: 'INSERT',
          data: Object.assign({}, payload, { recur_group_id: null, recur_pattern: null }),
          log: { action: 'create' },
        });
        if (recurPattern) {
          const groupId = 'rg_' + Date.now();
          await dbWrite({ table: 'events', method: 'UPDATE', data: { recur_group_id: groupId, recur_pattern: recurPattern }, match: { id: inserted.id } });
          const dates = recurDates(payload.date, recurPattern);
          for (const d of dates) {
            await dbWrite({
              table: 'events',
              method: 'INSERT',
              data: Object.assign({}, payload, { date: d, featured: false, recur_group_id: groupId, recur_pattern: recurPattern }),
            });
          }
        }
      }
      setFormOpen(false);
      setEditingEvent(null);
      setRecurScope(null);
      await load();
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(ev) {
    setSelectedEvent(null);
    if (ev.recur_group_id) {
      setRecurScope({ mode: 'delete', event: ev });
    } else {
      setConfirmState({
        message: 'Hapus event "' + ev.title + '"?',
        onConfirm: () => doDeleteOne(ev.id),
      });
    }
  }

  function deleteWithUndo(ids, message) {
    const snapshot = events.filter((e) => ids.includes(e.id));
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
    setUndoState({ message, ids, snapshot });
  }

  function handleUndo() {
    if (!undoState) return;
    setEvents((prev) => [...prev, ...undoState.snapshot].sort((a, b) => a.date.localeCompare(b.date)));
    setUndoState(null);
  }

  async function handleUndoExpire() {
    if (!undoState) return;
    const { ids } = undoState;
    setUndoState(null);
    try {
      for (const id of ids) {
        await dbWrite({ table: 'events', method: 'DELETE', match: { id }, log: { event_id: id, action: 'delete' } });
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
      await load();
    }
  }

  function doDeleteOne(id) {
    setConfirmState(null);
    deleteWithUndo([id], 'Event dihapus.');
  }

  function requestExtend(ev) {
    setSelectedEvent(null);
    const instances = events.filter((e) => e.recur_group_id === ev.recur_group_id);
    const ext = computeExtension(instances);
    if (!ext) {
      alert('Event ini tidak punya pola recurring yang valid.');
      return;
    }
    if (!ext.toCreate.length) {
      alert(`Tidak ada tanggal baru untuk ditambahkan di rentang ${ext.nextQStart.slice(0, 7)} – ${ext.nextQEnd.slice(0, 7)}.`);
      return;
    }
    setConfirmState({
      message: `Tambahkan ${ext.toCreate.length} event baru untuk rangkaian ini, dari ${ext.nextQStart.slice(0, 7)} sampai ${ext.nextQEnd.slice(0, 7)}?`,
      onConfirm: () => doExtend(ext, ev.recur_group_id),
    });
  }

  async function doExtend(ext, groupId) {
    setConfirmState(null);
    try {
      const base = { ...ext.first };
      delete base.id;
      delete base.created_at;
      for (const d of ext.toCreate) {
        await dbWrite({
          table: 'events',
          method: 'INSERT',
          data: { ...base, date: d, featured: false, recur_group_id: groupId, recur_pattern: ext.pattern },
        });
      }
      await load();
    } catch (err) {
      alert('Gagal memperpanjang rangkaian: ' + err.message);
    }
  }

  async function handleExport({ format, scope, monthFrom, monthTo }) {
    if (format === 'png') {
      setExportOpen(false);
      setExporting(true);
      try {
        await exportPNG(calWrapRef.current, `Kalender_Naposo_${MONTHS_ID[month]}_${year}.png`);
      } catch (err) {
        alert('Gagal membuat PNG: ' + err.message);
      } finally {
        setExporting(false);
      }
      return;
    }

    let evs;
    if (scope === 'month') {
      const prefix = year + '-' + String(month + 1).padStart(2, '0');
      evs = filteredEvents.filter((e) => e.date.startsWith(prefix) && e.status !== 'draft');
    } else if (scope === 'pick') {
      const from = Math.min(monthFrom, monthTo);
      const to = Math.max(monthFrom, monthTo);
      evs = filteredEvents.filter((e) => {
        if (!e.date.startsWith(String(year))) return false;
        const m = parseInt(e.date.slice(5, 7)) - 1;
        return m >= from && m <= to && e.status !== 'draft';
      });
    } else if (scope === 'cat' && activeCats.size > 0) {
      evs = events.filter((e) => activeCats.has(e.category) && e.status !== 'draft');
    } else {
      evs = events.filter((e) => e.date.startsWith(String(year)) && e.status !== 'draft');
    }
    evs = [...evs].sort((a, b) => a.date.localeCompare(b.date));

    const MO = MONTHS_ID;
    const scopeLabel =
      scope === 'month' ? `_${MO[month]}` :
      scope === 'pick' ? `_${MO[Math.min(monthFrom, monthTo)]}-${MO[Math.max(monthFrom, monthTo)]}` :
      scope === 'cat' && activeCats.size > 0 ? `_${activeCats.size}Kategori` : '';

    setExportOpen(false);
    if (format === 'csv') exportCSV(evs, catLabel, year, scopeLabel);
    else if (format === 'ical') exportICal(evs, catLabel, year, scopeLabel);
    else if (format === 'pdf') exportPDF(evs, catColor, catLabel, scopeLabel);
  }

  function doDeleteAllUpcoming(groupId) {
    setRecurScope(null);
    const todayStr = new Date().toISOString().slice(0, 10);
    const toDelete = events.filter((e) => e.recur_group_id === groupId && e.date >= todayStr);
    deleteWithUndo(toDelete.map((e) => e.id), `${toDelete.length} event berulang dihapus.`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center rounded-full border overflow-hidden" style={{ borderColor: 'var(--border2)' }}>
          <button onClick={() => setView('grid')} className="p-1.5" style={{ background: view === 'grid' ? 'var(--blue)' : 'transparent', color: view === 'grid' ? '#fff' : 'var(--text2)' }}>
            <Grid3x3 size={14} />
          </button>
          <button onClick={() => setView('agenda')} className="p-1.5" style={{ background: view === 'agenda' ? 'var(--blue)' : 'transparent', color: view === 'agenda' ? '#fff' : 'var(--text2)' }}>
            <List size={14} />
          </button>
        </div>

        <button onClick={() => switchMonth(-1)} className="p-1.5 rounded-full border" style={{ borderColor: 'var(--border2)' }}>
          <ChevronLeft size={14} />
        </button>
        <h2 className="font-serif font-bold text-base min-w-[140px] text-center" style={{ color: 'var(--text)' }}>
          {MONTHS_ID[month]} {year}
        </h2>
        <button onClick={() => switchMonth(1)} className="p-1.5 rounded-full border" style={{ borderColor: 'var(--border2)' }}>
          <ChevronRight size={14} />
        </button>
        <button onClick={goToday} className="text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
          Hari ini
        </button>

        <div className="flex-1" />

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari event…"
            className="text-xs rounded-full border pl-7 pr-3 py-1.5 outline-none w-36"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>
        <CategoryFilter categories={categories} activeCats={activeCats} onToggle={toggleCat} onReset={() => setActiveCats(new Set())} />

        <button onClick={() => setExportOpen(true)} disabled={exporting} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border disabled:opacity-60" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
          <Download size={13} /> {exporting ? 'Memproses…' : 'Export'}
        </button>

        {session.loggedIn && (
          <>
            <button onClick={() => setCatMgrOpen(true)} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
              <Settings size={13} /> Kategori
            </button>
            <button onClick={openAddForm} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy">
              <Plus size={13} /> Tambah Event
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text3)' }}>Memuat kalender…</div>
      ) : error ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--red)' }}>Gagal memuat data: {error}</div>
      ) : (
        <div ref={calWrapRef}>
          {view === 'grid' ? (
            <MonthGrid
              year={year}
              month={month}
              events={monthEvents}
              catColor={catColor}
              onSelectEvent={setSelectedEvent}
              onShowMore={(date, evs) => setDayPopup({ date, events: evs })}
            />
          ) : (
            <AgendaView
              events={monthEvents}
              catColor={catColor}
              catLabel={catLabel}
              onSelectEvent={setSelectedEvent}
              onPrevMonth={() => switchMonth(-1)}
              onNextMonth={() => switchMonth(1)}
            />
          )}
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          catColor={catColor}
          catLabel={catLabel}
          onClose={() => setSelectedEvent(null)}
          isAdmin={session.loggedIn}
          onEdit={openEditForm}
          onDelete={requestDelete}
          onExtend={requestExtend}
        />
      )}
      {dayPopup && (
        <DayPopup
          date={dayPopup.date}
          events={dayPopup.events}
          catColor={catColor}
          catLabel={catLabel}
          onSelectEvent={(ev) => { setDayPopup(null); setSelectedEvent(ev); }}
          onClose={() => setDayPopup(null)}
        />
      )}
      {formOpen && (
        <EventFormModal
          categories={categories}
          catLabel={catLabel}
          initial={editingEvent}
          saving={saving}
          onClose={() => { setFormOpen(false); setEditingEvent(null); }}
          onSave={handleSave}
        />
      )}
      {confirmState && (
        <ConfirmModal message={confirmState.message} confirmLabel="Hapus" onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState(null)} />
      )}
      {recurScope && recurScope.mode === 'edit' && (
        <RecurScopeModal
          mode="edit"
          onChooseOne={() => doSave(recurScope.payload, null, 'one')}
          onChooseAll={() => doSave(recurScope.payload, null, 'all')}
          onCancel={() => setRecurScope(null)}
        />
      )}
      {recurScope && recurScope.mode === 'delete' && (
        <RecurScopeModal
          mode="delete"
          onChooseOne={() => doDeleteOne(recurScope.event.id)}
          onChooseAll={() => doDeleteAllUpcoming(recurScope.event.recur_group_id)}
          onCancel={() => setRecurScope(null)}
        />
      )}
      {catMgrOpen && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setCatMgrOpen(false)}
          onChanged={load}
        />
      )}
      {exportOpen && (
        <ExportModal
          currentMonth={month}
          hasCategoryFilter={activeCats.size > 0}
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
        />
      )}
      {undoState && (
        <UndoToast message={undoState.message} onUndo={handleUndo} onDismiss={handleUndoExpire} />
      )}
    </div>
  );
}
