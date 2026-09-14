export async function dbWrite({ table, method, data, match, log }) {
  const res = await fetch('/api/admin/db-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, method, data, match, log }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menyimpan');
  return json.data || [];
}
