'use client';

import { driveToThumbnail } from '@/lib/drive';
import { formatFullDate } from '@/lib/dates';
import { useLanguage } from '@/context/LanguageContext';
import ReactionBar from './ReactionBar';

export default function PostCard({ post, isNew, onOpen }) {
  const { t, lang } = useLanguage();
  const dayLabel = post.day_type === 'senin' ? t('rev_day_senin') : t('rev_day_jumat');
  const snippet = post.excerpt || (post.body || '').replace(/\n/g, ' ').slice(0, 140) + '…';

  return (
    <button
      onClick={() => onOpen(post)}
      className="text-left rounded-2xl border overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {post.published === false && (
        <span
          className="absolute top-2 left-2 z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(245,158,11,.9)', color: '#fff' }}
        >
          {t('rev_draft_badge')}
        </span>
      )}
      {isNew && (
        <span
          className="absolute top-2 right-2 z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
        >
          {t('rev_new_badge')}
        </span>
      )}
      {post.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={driveToThumbnail(post.poster_url)} alt={post.title} className="w-full aspect-video object-cover" loading="lazy" />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-3xl" style={{ background: 'var(--sky-pale)' }}>
          ✝️
        </div>
      )}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: 'var(--blue)' }}>
          <span className="rounded-full px-2 py-0.5" style={{ background: 'var(--sky-pale)' }}>
            {post.day_type === 'senin' ? '🌅' : '🌿'} {dayLabel}
          </span>
          <span style={{ color: 'var(--text3)' }}>{formatFullDate(post.date, lang)}</span>
        </div>
        <h3 className="font-serif font-bold text-base leading-snug" style={{ color: 'var(--text)' }}>
          {post.title}
        </h3>
        {post.verse_ref && (
          <p className="text-xs italic" style={{ color: 'var(--text2)' }}>
            {post.verse_ref}
          </p>
        )}
        <p className="text-sm line-clamp-2 flex-1" style={{ color: 'var(--text2)' }}>
          {snippet}
        </p>
        <div className="mt-2">
          <ReactionBar postId={post.id} />
        </div>
      </div>
    </button>
  );
}
