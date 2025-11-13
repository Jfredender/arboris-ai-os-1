
export const defaultLocale = 'pt' as const;
export const locales = ['pt', 'en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
};
