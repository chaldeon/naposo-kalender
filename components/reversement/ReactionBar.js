'use client';

import { useEffect, useState } from 'react';
import { REACTION_TYPES, REACTION_META, getMyReaction, fetchReactionCounts, toggleReaction } from '@/lib/reversementReactions';
import { useLanguage } from '@/context/LanguageContext';

export default function ReactionBar({ postId, dark = false }) {
  const [counts, setCounts] = useState({ amin: 0, tersentuh: 0, menguatkan: 0 });
  const [myReaction, setLocalReaction] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    setLocalReaction(getMyReaction(postId));
    fetchReactionCounts(postId).then(setCounts);
  }, [postId]);

  async function handleClick(type) {
    // Optimistic update
    const isSame = myReaction === type;
    setCounts((prev) => {
      const next = { ...prev };
      if (myReaction && next[myReaction] > 0) next[myReaction]--;
      if (!isSame) next[type]++;
      return next;
    });
    setLocalReaction(isSame ? null : type);
    const fresh = await toggleReaction(postId, type);
    setCounts(fresh);
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {REACTION_TYPES.map((type) => {
        const meta = REACTION_META[type];
        const n = counts[type] || 0;
        const active = myReaction === type;
        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            title={t('rx_' + type)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
            style={
              active
                ? { background: 'var(--gold)', color: 'var(--navy)' }
                : dark
                ? { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)' }
                : { background: 'var(--surface2)', color: 'var(--text2)' }
            }
          >
            <span>{meta.emoji}</span>
            {n > 0 && <span className="font-semibold">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}
