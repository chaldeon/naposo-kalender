import { getExtraFields } from '@/lib/eventExtraFields';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCSV(events, catLabel, year, scopeLabel) {
  const rows = [['Tanggal', 'Hari', 'Judul', 'Jam', 'Kategori', 'Info Tambahan', 'Catatan']];
  events.forEach((ev) => {
    const d = new Date(ev.date + 'T00:00:00');
    const fields = getExtraFields(catLabel(ev.category));
    const extraVal = fields.length && ev.extra ? fields.filter((f) => ev.extra[f.key]).map((f) => `${f.label}: ${ev.extra[f.key]}`).join('; ') : '';
    rows.push([ev.date, DAY_NAMES[d.getDay()], ev.title, ev.time || '', catLabel(ev.category), extraVal, ev.note || '']);
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `Kalender_Naposo_${year}${scopeLabel}.csv`);
}

export function exportICal(events, catLabel, year, scopeLabel) {
  let ical =
    'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Naposo HKBP Ujung Menteng//Kalender Pelayanan//ID\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Kalender Pelayanan Naposo HKBP Ujung Menteng\r\nX-WR-TIMEZONE:Asia/Jakarta\r\n';

  events.forEach((ev) => {
    const uid = ev.id + '@naposo-hkbp-ujung-menteng';
    const dateStr = ev.date.replace(/-/g, '');
    let dtStart, dtEnd;
    const isAllDay = !ev.time;

    if (ev.time && ev.time.includes('–')) {
      const [ts, te] = ev.time.split('–');
      dtStart = `${dateStr}T${ts.replace(':', '')}00`;
      dtEnd = `${dateStr}T${te.replace(':', '')}00`;
    } else if (ev.time) {
      const [h, m] = ev.time.split(':');
      dtStart = `${dateStr}T${ev.time.replace(':', '')}00`;
      dtEnd = `${dateStr}T${String(parseInt(h) + 1).padStart(2, '0')}${m}00`;
    } else {
      dtStart = dateStr;
      dtEnd = dateStr;
    }

    ical += 'BEGIN:VEVENT\r\n';
    ical += `UID:${uid}\r\n`;
    ical += `SUMMARY:${ev.title}\r\n`;
    if (isAllDay) {
      ical += `DTSTART;VALUE=DATE:${dtStart}\r\n`;
      ical += `DTEND;VALUE=DATE:${dtEnd}\r\n`;
    } else {
      ical += `DTSTART;TZID=Asia/Jakarta:${dtStart}\r\n`;
      ical += `DTEND;TZID=Asia/Jakarta:${dtEnd}\r\n`;
    }
    if (ev.note) ical += `DESCRIPTION:${ev.note.replace(/\n/g, '\\n')}\r\n`;
    ical += `CATEGORIES:${catLabel(ev.category)}\r\n`;
    ical += 'END:VEVENT\r\n';
  });

  ical += 'END:VCALENDAR\r\n';
  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8;' });
  triggerDownload(blob, `Kalender_Naposo_${year}${scopeLabel}.ics`);
}

// Port dari exportPDF() lama: buka window baru berisi tabel event dikelompokkan
// per bulan, lalu panggil window.print() — user tinggal "Save as PDF" di dialog print.
export function exportPDF(events, catColor, catLabel, scopeLabel) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.');
    return;
  }

  const groupByMonth = {};
  events.forEach((ev) => {
    const m = ev.date.slice(0, 7);
    (groupByMonth[m] ||= []).push(ev);
  });

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  let tableRows = '';
  Object.keys(groupByMonth).sort().forEach((ym) => {
    const [y, m] = ym.split('-');
    tableRows += `<tr class="month-header"><td colspan="6">${monthNames[parseInt(m) - 1]} ${y}</td></tr>`;
    groupByMonth[ym].forEach((ev, i) => {
      const d = new Date(ev.date + 'T00:00:00');
      const col = catColor(ev.category);
      const fields = getExtraFields(catLabel(ev.category));
      const xv = fields.length && ev.extra ? fields.filter((f) => ev.extra[f.key]).map((f) => ev.extra[f.key]).join(', ') || '—' : '—';
      tableRows += `<tr class="${i % 2 === 1 ? 'odd' : ''}">
        <td>${ev.date}</td>
        <td>${dayNames[d.getDay()]}</td>
        <td>${escapeHtml(ev.title)}</td>
        <td>${ev.time || '—'}</td>
        <td><span class="cat-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${escapeHtml(catLabel(ev.category))}</span></td>
        <td>${escapeHtml(xv)}</td>
      </tr>`;
    });
  });

  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Kalender Pelayanan Naposo</title>
  <style>
    body{font-family:'DM Sans',Arial,sans-serif;color:#1e293b;margin:24px}
    .cover{text-align:center;margin-bottom:24px}
    .cover h1{font-family:Georgia,serif;margin-bottom:4px}
    .cover .scope{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:999px;background:#eff6ff;color:#2563be;font-size:13px;font-weight:600}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{text-align:left;padding:6px 8px;border-bottom:2px solid #1e293b;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
    td{padding:5px 8px;border-bottom:1px solid #e2e8f0}
    tr.odd{background:#f8fafc}
    tr.month-header td{background:#0a1f44;color:#fff;font-weight:700;padding:8px;font-size:13px}
    .cat-badge{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600}
    .footer{margin-top:20px;text-align:center;font-size:11px;color:#94a3b8}
    @media print{ body{margin:8mm} }
  </style></head><body>
  <div class="cover">
    <h1>Kalender Pelayanan Naposo HKBP Ujung Menteng</h1>
    <p>Diekspor ${dateStr}</p>
    <span class="scope">📅 ${scopeLabel.replace(/^_/, '').replace(/_/g, ' ') || 'Semua Bulan'}</span>
  </div>
  <table>
    <thead><tr><th>Tanggal</th><th>Hari</th><th>Judul</th><th>Jam</th><th>Kategori</th><th>Info</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">${events.length} event ditampilkan</div>
  </body></html>`;

  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Port dari exportPNG() lama (html2canvas), sekarang lewat npm import bukan CDN.
export async function exportPNG(element, filename) {
  const { default: html2canvas } = await import('html2canvas');
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff';
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: bg, logging: false });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Gagal membuat gambar.'));
      triggerDownload(blob, filename);
      resolve();
    }, 'image/png');
  });
}
