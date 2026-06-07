import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from './locales/ar.json';
import he from './locales/he.json';
import en from './locales/en.json';

const resources = {
  ar: { translation: ar },
  he: { translation: he },
  en: { translation: en },
};

export const LANGUAGE_DIR: Record<string, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  he: 'rtl',
  en: 'ltr',
};

export function applyDirection(lang: string) {
  const dir = LANGUAGE_DIR[lang] ?? 'rtl';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'he', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

// Apply direction on initial load and whenever language changes
applyDirection(i18n.language || 'ar');
i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
});

export default i18n;
