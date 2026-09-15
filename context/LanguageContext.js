'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '@/lib/i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('id');

  useEffect(() => {
    const saved = localStorage.getItem('naposo_lang') || 'id';
    setLang(saved);
  }, []);

  function toggleLang() {
    const next = lang === 'id' ? 'en' : 'id';
    setLang(next);
    localStorage.setItem('naposo_lang', next);
  }

  function t(key) {
    return translations[key]?.[lang] ?? translations[key]?.id ?? key;
  }

  return <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
