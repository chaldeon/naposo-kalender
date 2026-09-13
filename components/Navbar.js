'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CalendarDays, Cross, BarChart3, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/reversement', label: 'Reversement', icon: Cross },
  { href: '/statistik', label: 'Statistik', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState({ loggedIn: false });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ loggedIn: false }));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession({ loggedIn: false });
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-[400] text-white shadow-[0_2px_16px_rgba(10,31,68,.35)]"
      style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--blue-mid) 60%, var(--blue) 100%)' }}
    >
      <div className="flex items-center justify-between gap-2.5 px-3 h-[60px]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0 no-underline text-white hover:opacity-80 transition-opacity">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="shrink-0">
            <circle cx="20" cy="20" r="19" stroke="#c9a227" strokeWidth="1.5" fill="rgba(201,162,39,.08)" />
            <rect x="17" y="7" width="6" height="26" rx="1.5" fill="#c9a227" />
            <rect x="9" y="15" width="22" height="6" rx="1.5" fill="#c9a227" />
          </svg>
          <h1 className="font-serif text-base font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            Naposo HKBP Ujung Menteng
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title="Toggle Dark Mode"
            className="flex items-center justify-center bg-white/10 border border-white/20 text-white/85 hover:bg-white/20 hover:text-white rounded-md px-2.5 py-1 transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <div className="w-px h-[22px] bg-white/20 mx-1" />

          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold no-underline transition-all hover:-translate-y-px ${
                  active
                    ? 'bg-gold text-navy border border-gold'
                    : 'bg-white/15 text-white border border-white/25 hover:bg-white/22'
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}

          {session.loggedIn ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold bg-gold text-navy"
            >
              <Lock size={13} />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold no-underline bg-gold text-navy"
            >
              <Lock size={13} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile: cukup toggle tema + link login/logout, nav utama pindah ke bottom bar (menyusul) */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="bg-white/10 border border-white/20 rounded-md px-2 py-1">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
