'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { dbWrite } from '@/lib/dbWrite';
import PostCard from '@/components/reversement/PostCard';
import PostModal from '@/components/reversement/PostModal';
import Pagination from '@/components/reversement/Pagination';
import PostFormModal from '@/components/reversement/PostFormModal';
import ConfirmModal from '@/components/calendar/ConfirmModal';

const PAGE_SIZE = 6;
const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'senin', label: '🌅 Senin' },
  { id: 'jumat', label: '🌿 Jumat' },
];

export default function ReversementPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [allPostsCache, setAllPostsCache] = useState(null);
  const [selected, setSelected] = useState(null);
  const [session, setSession] = useState({ loggedIn: false });
  const [refreshTick, setRefreshTick] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setSession).catch(() => {});
  }, []);

  // Pagination mode (tidak sedang search)
  useEffect(() => {
    if (query.trim()) return;
    async function load() {
      setLoading(true);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q = supabase.from('reversement_posts').select('*', { count: 'exact' }).order('date', { ascending: false });
      if (!session.loggedIn) q = q.eq('published', true);
      if (filter !== 'all') q = q.eq('day_type', filter);
      const { data, count } = await q.range(from, to);
      setPosts(data || []);
      setTotal(count || 0);
      setLoading(false);
    }
    load();
  }, [page, filter, query, session.loggedIn, refreshTick]);

  // Search mode
  useEffect(() => {
    if (!query.trim()) return;
    async function loadAll() {
      setLoading(true);
      let q = supabase.from('reversement_posts').select('*').order('date', { ascending: false });
      if (!session.loggedIn) q = q.eq('published', true);
      const { data } = await q;
      setAllPostsCache(data || []);
      setLoading(false);
    }
    loadAll();
  }, [query, session.loggedIn, refreshTick]);

  const searchResults = useMemo(() => {
    if (!query.trim() || !allPostsCache) return null;
    const q = query.trim().toLowerCase();
    return allPostsCache.filter(
      (p) => (p.title || '').toLowerCase().includes(q) || (p.verse_ref || '').toLowerCase().includes(q) || (p.body || '').toLowerCase().includes(q)
    );
  }, [query, allPostsCache]);

  const displayed = searchResults ?? posts;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleFilter(f) {
    setFilter(f);
    setQuery('');
    setPage(1);
  }

  function refresh() {
    setAllPostsCache(null);
    setRefreshTick((t) => t + 1);
  }

  function openAddForm() {
    setEditingPost(null);
    setFormOpen(true);
  }

  function openEditForm(post) {
    setSelected(null);
    setEditingPost(post);
    setFormOpen(true);
  }

  async function handleSave(payload, id, isEdit) {
    setSaving(true);
    try {
      if (isEdit) {
        await dbWrite({ table: 'reversement_posts', method: 'UPDATE', data: payload, match: { id } });
      } else {
        await dbWrite({ table: 'reversement_posts', method: 'INSERT', data: { ...payload, id } });
      }
      setFormOpen(false);
      setEditingPost(null);
      refresh();
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(post) {
    setSelected(null);
    setConfirmState({
      message: `Hapus post "${post.title}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await dbWrite({ table: 'reversement_posts', method: 'DELETE', match: { id: post.id } });
          refresh();
        } catch (err) {
          alert('Gagal menghapus: ' + err.message);
        }
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-xs font-semibold tracking-wide mb-1" style={{ color: 'var(--gold)' }}>
          RENUNGAN MINGGUAN
        </div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Reversement
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Ayat dan renungan untuk memulai harimu bersama Naposo · Senin &amp; Jumat
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 justify-center">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilter(f.id)}
            className="text-xs font-semibold rounded-full px-3.5 py-1.5 border"
            style={
              filter === f.id
                ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' }
                : { borderColor: 'var(--border2)', color: 'var(--text2)' }
            }
          >
            {f.label}
          </button>
        ))}
        <div className="relative ml-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari renungan…"
            className="text-xs rounded-full border pl-7 pr-3 py-1.5 outline-none w-40"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>
        {session.loggedIn && (
          <button onClick={openAddForm} className="flex items-center gap-1 text-xs font-semibold rounded-full px-3.5 py-1.5 bg-gold text-navy">
            <Plus size={13} /> Tambah Post
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text3)' }}>
          Memuat…
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-2">{filter !== 'all' || query ? '🔍' : '📖'}</div>
          <div className="font-semibold" style={{ color: 'var(--text)' }}>
            {query ? 'Tidak ada hasil pencarian' : filter !== 'all' ? 'Tidak ada post untuk filter ini' : 'Belum ada konten'}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {query ? 'Coba kata kunci lain.' : 'Konten akan hadir setiap Senin dan Jumat.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {displayed.map((post, idx) => (
              <PostCard key={post.id} post={post} isNew={!query && page === 1 && idx === 0} onOpen={setSelected} />
            ))}
          </div>
          {!query && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </>
      )}

      <PostModal post={selected} onClose={() => setSelected(null)} isAdmin={session.loggedIn} onEdit={openEditForm} onDelete={requestDelete} />

      {formOpen && (
        <PostFormModal
          initial={editingPost}
          saving={saving}
          onClose={() => { setFormOpen(false); setEditingPost(null); }}
          onSave={handleSave}
        />
      )}
      {confirmState && (
        <ConfirmModal message={confirmState.message} confirmLabel="Hapus" onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState(null)} />
      )}
    </div>
  );
}
