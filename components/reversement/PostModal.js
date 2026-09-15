'use client';

import { X } from 'lucide-react';
import { driveToThumbnail } from '@/lib/drive';
import { formatFullDate } from '@/lib/dates';
import { useLanguage } from '@/context/LanguageContext';
import ReactionBar from './ReactionBar';

export default function PostModal({ post, onClose, isAdmin, onEdit, onDelete }) {
  const { t, lang } = useLanguage();
  if (!post) return null;
  const dayLabel = post.day_type === 'senin' ? t('rev_day_senin') : t('rev_day_jumat');

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(10,31,68,.6)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col relative"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,.4)', color: '#fff' }}
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto">
          {post.poster_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={driveToThumbnail(post.poster_url, 'w800')} alt={post.title} className="w-full aspect-video object-cover" />
          )}
          <div className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
              <span className="rounded-full px-2 py-0.5" style={{ background: 'var(--sky-pale)' }}>
                {post.day_type === 'senin' ? '🌅' : '🌿'} {dayLabel}
              </span>
              <span style={{ color: 'var(--text3)' }}>{formatFullDate(post.date, lang)}</span>
            </div>
            <h2 className="font-serif font-bold text-xl leading-snug" style={{ color: 'var(--text)' }}>
              {post.title}
            </h2>
            {post.verse_ref && (
              <p className="text-sm italic font-medium" style={{ color: 'var(--blue-mid)' }}>
                {post.verse_ref}
              </p>
            )}
            <div className="text-sm whitespace-pre-line mt-2" style={{ color: 'var(--text)', lineHeight: 1.7 }}>
              {post.body}
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <ReactionBar postId={post.id} />
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => onEdit(post)} className="text-xs font-semibold rounded-full px-3 py-1.5 border" style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
                    {t('rev_edit')}
                  </button>
                  <button onClick={() => onDelete(post)} className="text-xs font-semibold rounded-full px-3 py-1.5" style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)' }}>
                    {t('rev_delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
