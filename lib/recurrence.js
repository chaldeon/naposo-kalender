import { localDateStr } from '@/lib/dates';

// Kuartal: Jan-Mar | Apr-Jun | Jul-Sep | Okt-Des
export function recurQuarterEnd(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth();
  const lastMonth = [2, 5, 8, 11].find((x) => x >= m);
  const end = new Date(d.getFullYear(), lastMonth + 1, 0);
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
}

export function recurNextQuarterStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth();
  const lastMonth = [2, 5, 8, 11].find((x) => x >= m);
  const next = new Date(d.getFullYear(), lastMonth + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`;
}

// Generate semua tanggal instance (eksklusif tanggal awal), sampai akhir kuartal.
export function recurDates(startDateStr, pattern) {
  const quarterEnd = recurQuarterEnd(startDateStr);
  const dates = [];
  const d = new Date(startDateStr + 'T00:00:00');
  const stepDays = pattern === 'weekly' ? 7 : pattern === 'biweekly' ? 14 : 0;
  const isMonthly = pattern === 'monthly';
  const dayOfMonth = d.getDate();

  let cur = new Date(d);
  while (true) {
    if (isMonthly) {
      cur.setMonth(cur.getMonth() + 1);
      const maxDay = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      cur.setDate(Math.min(dayOfMonth, maxDay));
    } else {
      cur.setDate(cur.getDate() + stepDays);
    }
    const ds = localDateStr(cur);
    if (ds > quarterEnd) break;
    dates.push(ds);
  }
  return dates;
}

export const RECUR_PATTERNS = [
  { id: '', labelKey: 'form_recur_none' },
  { id: 'weekly', labelKey: 'form_recur_weekly' },
  { id: 'biweekly', labelKey: 'form_recur_biweekly' },
  { id: 'monthly', labelKey: 'form_recur_monthly' },
];

// Port dari extendRecurGroup() lama: hitung tanggal instance baru dari kuartal
// berikutnya untuk sebuah grup recurring. Return null kalau tidak ada yang perlu dibuat.
export function computeExtension(instances) {
  if (!instances.length) return null;
  const sorted = [...instances].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const pattern = first.recur_pattern;
  if (!pattern) return null;

  const nextQStart = recurNextQuarterStart(last.date);
  const nextQEnd = recurQuarterEnd(nextQStart);

  const newDates = recurDates(last.date, pattern).filter((d) => d >= nextQStart);
  const extraDates = recurDates(nextQStart.slice(0, 8) + '01', pattern).filter((d) => d >= nextQStart && d <= nextQEnd);

  const existingDates = new Set(sorted.map((e) => e.date));
  const toCreate = [...new Set([...newDates, ...extraDates])].filter((d) => !existingDates.has(d) && d <= nextQEnd).sort();

  if (!toCreate.length) return { toCreate: [], nextQStart, nextQEnd, pattern, first };
  return { toCreate, nextQStart, nextQEnd, pattern, first };
}
