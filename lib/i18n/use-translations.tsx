
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { translations } from './translations';
import { defaultLocale, type Locale } from './config';

type TranslationValue = string | Record<string, any>;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
});

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arboris-locale');
      if (stored && (stored === 'pt' || stored === 'en' || stored === 'es')) {
        return stored as Locale;
      }
    }
    return defaultLocale;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arboris-locale', locale);
    }
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: TranslationValue = translations[locale];
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for locale ${locale}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const contextValue: LocaleContextType = {
    locale,
    setLocale,
    t,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslations must be used within LocaleProvider');
  }
  return context;
}
