'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MONTHS_ID } from '@/lib/dates';
import { DEF_CAT_LABELS, DEF_CAT_COLORS, MONTHS_SHORT_ID } from '@/lib/statCategories';
import KpiCard from '@/components/statistik/KpiCard';
import BarChart from '@/components/statistik/BarChart';
import CategoryBars from '@/components/statistik/CategoryBars';
import EventsTable from '@/components/statistik/EventsTable';

function dedupeVisits(visits) {
  const seen = new Set();
  return (visits || []).filter((v) => {
    if (!v.session_id || seen.has(v.session_id)) return false;
    seen.add(v.session_id);
    return true;
  });
}

export default function StatistikPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [visits, setVisits] = useState([]);
  const [revPosts, setRevPosts] = useState([]);
  const [revReactions, setRevReactions] = useState([]);
  const [recapItems, setRecapItems] = useState([]);
  const [catLabels, setCatLabels] = useState(DEF_CAT_LABELS);
  const [catColors, setCatColors] = useState(DEF_CAT_COLORS);
  const [visitView, setVisitView] = useState('daily');

  const currentYear = new Date().getFullYear().toString();
  const [year, setYear] = useState(currentYear);
  const [monthFrom, setMonthFrom] = useState(0);
  const [monthTo, setMonthTo] = useState(11);
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: cats }, { data: evs }, { data: vis }, { data: posts }, { data: reactions }, { data: recap }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('events').select('id,date,title,category,status').order('date', { ascending: false }),
        supabase.from('visits').select('id,session_id,created_at').order('created_at', { ascending: false }),
        supabase.from('reversement_posts').select('id,created_at'),
        supabase.from('reversement_reactions').select('id,type'),
        supabase.from('recap_items').select('*'),
      ]);
      if (cats?.length) {
        const nl = {}, nc = {};
        cats.forEach((c) => {
          nl[c.id] = c.label_id || c.id;
          nc[c.id] = c.color || '#94a3b8';
        });
        setCatLabels((prev) => ({ ...prev, ...nl }));
        setCatColors((prev) => ({ ...prev, ...nc }));
      }
      setEvents(evs || []);
      setVisits(dedupeVisits(vis));
      setRevPosts(posts || []);
      setRevReactions(reactions || []);
      setRecapItems(recap || []);
      setLoading(false);
    }
    load();
  }, []);

  const years = useMemo(() => {
    const s = new Set(events.map((e) => e.date.slice(0, 4)));
    return [...s].sort().reverse();
  }, [events]);

  const categoriesInData = useMemo(() => [...new Set(events.map((e) => e.category))].sort(), [events]);

  const filteredEvents = useMemo(() => {
    const from = Math.min(monthFrom, monthTo);
    const to = Math.max(monthFrom, monthTo);
    return events.filter((e) => {
      if (!e.date.startsWith(year)) return false;
      const m = parseInt(e.date.slice(5, 7)) - 1;
      if (m < from || m > to) return false;
      if (catFilter && e.category !== catFilter) return false;
      return true;
    });
  }, [events, year, monthFrom, monthTo, catFilter]);

  // ── KPI ──
  const now = new Date();
  const monStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const kpiTotal = events.length;
  const kpiMonth = events.filter((e) => e.date.startsWith(monStr)).length;
  const kpiDraft = events.filter((e) => e.status === 'draft').length;
  const kpiVisits = visits.length;

  let kpiVisitsWeekLabel = 'KUNJUNGAN 7 HARI';
  let kpiVisitsWeek = 0;
  if (visitView === 'weekly') {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    kpiVisitsWeek = visits.filter((v) => v.created_at && new Date(v.created_at) >= monday).length;
    kpiVisitsWeekLabel = 'MINGGU INI';
  } else if (visitView === 'monthly') {
    kpiVisitsWeek = visits.filter((v) => v.created_at?.startsWith(monStr)).length;
    kpiVisitsWeekLabel = 'BULAN INI';
  } else {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    kpiVisitsWeek = visits.filter((v) => v.created_at >= weekAgo).length;
  }

  // ── Visit chart data ──
  const visitChart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const labels = [];
    const data = [];
    if (visitView === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        labels.push(ds.slice(5));
        data.push(visits.filter((v) => v.created_at?.startsWith(ds)).length);
      }
    } else if (visitView === 'weekly') {
      const day = today.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const thisMon = new Date(today);
      thisMon.setDate(today.getDate() + mondayOffset);
      for (let i = 11; i >= 0; i--) {
        const mon = new Date(thisMon);
        mon.setDate(thisMon.getDate() - i * 7);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        const monStr2 = mon.toISOString().slice(0, 10);
        const sunStr = sun.toISOString().slice(0, 10);
        labels.push(`${mon.getDate()}/${mon.getMonth() + 1}`);
        data.push(visits.filter((v) => { const d = v.created_at?.slice(0, 10) || ''; return d >= monStr2 && d <= sunStr; }).length);
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(MONTHS_SHORT_ID[d.getMonth()]);
        data.push(visits.filter((v) => v.created_at?.startsWith(ym)).length);
      }
    }
    return { labels, data };
  }, [visits, visitView]);

  // ── Month chart (event per bulan, sesuai filter) ──
  const monthChart = useMemo(() => {
    const from = Math.min(monthFrom, monthTo);
    const to = Math.max(monthFrom, monthTo);
    const labels = MONTHS_SHORT_ID.slice(from, to + 1);
    const data = labels.map((_, i) => {
      const mStr = `${year}-${String(from + i + 1).padStart(2, '0')}`;
      return events.filter((e) => e.date.startsWith(mStr) && e.status !== 'draft').length;
    });
    return { labels, data };
  }, [events, year, monthFrom, monthTo]);

  const catCounts = useMemo(() => {
    const counts = {};
    filteredEvents.filter((e) => e.status !== 'draft').forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
    return counts;
  }, [filteredEvents]);

  // ── Reversement & recap stats ──
  const revTotal = revPosts.length;
  const revSenin = revPosts.filter((p) => new Date(p.created_at).getDay() === 1).length;
  const revJumat = revPosts.filter((p) => new Date(p.created_at).getDay() === 5).length;
  const rxAmin = revReactions.filter((r) => r.type === 'amin').length;
  const rxTersentuh = revReactions.filter((r) => r.type === 'tersentuh').length;
  const rxMenguatkan = revReactions.filter((r) => r.type === 'menguatkan').length;
  const activeRecap = recapItems.filter((r) => r.active !== false);

  function resetFilter() {
    setYear(currentYear);
    setMonthFrom(0);
    setMonthTo(11);
    setCatFilter('');
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm" style={{ color: 'var(--text3)' }}>
        Memuat statistik…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-xl font-bold" style={{ color: 'var(--text)' }}>
          📊 Statistik Pelayanan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
          Data event, kunjungan, dan kategori kegiatan Naposo HKBP Ujung Menteng.
        </p>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border p-4 flex flex-wrap items-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div>
          <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text3)' }}>TAHUN</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text3)' }}>BULAN AWAL</label>
          <select value={monthFrom} onChange={(e) => setMonthFrom(parseInt(e.target.value))} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
            {MONTHS_ID.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text3)' }}>BULAN AKHIR</label>
          <select value={monthTo} onChange={(e) => setMonthTo(parseInt(e.target.value))} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
            {MONTHS_ID.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text3)' }}>KATEGORI</label>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="text-xs rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}>
            <option value="">Semua Kategori</option>
            {categoriesInData.map((c) => <option key={c} value={c}>{catLabels[c] || c}</option>)}
          </select>
        </div>
        <button onClick={resetFilter} className="text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
          ↺ Reset
        </button>
        <div className="text-xs basis-full mt-1" style={{ color: 'var(--text3)' }}>
          Menampilkan: {year} · {filteredEvents.length} event
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="TOTAL EVENT" value={kpiTotal} />
        <KpiCard label="BULAN INI" value={kpiMonth} />
        <KpiCard label="DRAFT" value={kpiDraft} />
        <KpiCard label="TOTAL KUNJUNGAN" value={kpiVisits} />
      </div>
      <div className="grid grid-cols-2 gap-3 -mt-3">
        <KpiCard label={kpiVisitsWeekLabel} value={kpiVisitsWeek} />
      </div>

      {/* Visit chart */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold tracking-wide" style={{ color: 'var(--text3)' }}>
            📈 KUNJUNGAN {visitView === 'daily' ? '30 HARI' : visitView === 'weekly' ? '12 MINGGU' : '12 BULAN'} TERAKHIR
          </div>
          <div className="flex gap-1">
            {['daily', 'weekly', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setVisitView(v)}
                className="text-[10px] font-semibold rounded-full px-2.5 py-1"
                style={visitView === v ? { background: 'var(--blue)', color: '#fff' } : { color: 'var(--text3)' }}
              >
                {v === 'daily' ? 'Harian' : v === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
        <BarChart labels={visitChart.labels} data={visitChart.data} label="Kunjungan" />
      </div>

      {/* Month chart */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="text-xs font-bold tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
          📅 EVENT PER BULAN ({year})
        </div>
        <BarChart labels={monthChart.labels} data={monthChart.data} label="Event" color="rgba(201,162,39,.6)" borderColor="rgba(201,162,39,.9)" />
      </div>

      {/* Category bars */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="text-xs font-bold tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
          🏷️ DISTRIBUSI KATEGORI
        </div>
        <CategoryBars counts={catCounts} labels={catLabels} colors={catColors} />
      </div>

      {/* Events table */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="text-xs font-bold tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
          🕐 EVENT TERBARU / AKAN DATANG
        </div>
        <EventsTable events={filteredEvents} labels={catLabels} />
      </div>

      {/* Reversement stats */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="text-xs font-bold tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
          ✝️ STATISTIK REVERSEMENT
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <KpiCard label="TOTAL POST" value={revTotal} />
          <KpiCard label="POST SENIN" value={revSenin} />
          <KpiCard label="POST JUMAT" value={revJumat} />
        </div>
        <div className="text-xs font-bold tracking-wide mb-2" style={{ color: 'var(--text3)' }}>
          🙏 TOTAL REAKSI
        </div>
        <div className="flex gap-4 text-sm">
          <span>🙏 Amin: <b>{rxAmin}</b></span>
          <span>❤️ Tersentuh: <b>{rxTersentuh}</b></span>
          <span>✨ Menguatkan: <b>{rxMenguatkan}</b></span>
        </div>
      </div>

      {/* Recap stats */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="text-xs font-bold tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
          📸 STATISTIK RECAP
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="ALBUM AKTIF" value={activeRecap.length} />
          <KpiCard label="TOTAL RECAP" value={recapItems.length} />
        </div>
      </div>
    </div>
  );
}