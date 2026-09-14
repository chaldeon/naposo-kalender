import { supabase } from '@/lib/supabase';

export const REACTION_TYPES = ['amin', 'tersentuh', 'menguatkan'];
export const REACTION_META = {
  amin: { emoji: '🙏', label: 'Amin' },
  tersentuh: { emoji: '❤️', label: 'Tersentuh' },
  menguatkan: { emoji: '✨', label: 'Menguatkan' },
};

export function getMyReaction(postId) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`rev_rx_${postId}`);
}

function setMyReaction(postId, type) {
  if (type) localStorage.setItem(`rev_rx_${postId}`, type);
  else localStorage.removeItem(`rev_rx_${postId}`);
}

function getSessionKey() {
  let key = sessionStorage.getItem('rev_session_key');
  if (!key) {
    key = crypto.randomUUID ? crypto.randomUUID() : `rsk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('rev_session_key', key);
  }
  return key;
}

export async function fetchReactionCounts(postId) {
  const { data } = await supabase.from('reversement_reactions').select('type').eq('post_id', postId);
  const counts = { amin: 0, tersentuh: 0, menguatkan: 0 };
  (data || []).forEach((r) => {
    if (counts[r.type] !== undefined) counts[r.type]++;
  });
  return counts;
}

// Toggle reaksi: klik tipe yang sama = batal, klik tipe lain = ganti (satu reaksi per sesi per post)
export async function toggleReaction(postId, type) {
  const prev = getMyReaction(postId);
  const isSame = prev === type;
  const sessionKey = getSessionKey();

  await supabase.from('reversement_reactions').delete().eq('post_id', postId).eq('user_key', sessionKey);
  if (!isSame) {
    await supabase.from('reversement_reactions').insert({ post_id: postId, type, user_key: sessionKey });
  }
  setMyReaction(postId, isSame ? null : type);
  return fetchReactionCounts(postId);
}
