'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || t('login_error_default'));
        return;
      }
      const redirectedFrom = searchParams.get('redirectedFrom') || '/';
      router.push(redirectedFrom);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-serif text-xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>
        {t('login_title')}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text2)' }}>
            {t('login_username')}
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border outline-none"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text2)' }}>
            {t('login_password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border outline-none"
            style={{ borderColor: 'var(--border2)', background: 'var(--surface)', color: 'var(--text)' }}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full font-semibold text-sm py-2 bg-gold text-navy disabled:opacity-60"
        >
          {loading ? t('login_loading') : t('login_submit')}
        </button>
      </form>
    </div>
  );
}

