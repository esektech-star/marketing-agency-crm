import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from './locales/ar.json';
import he from './locales/he.json';

// Only Hebrew + Arabic are supported (full RTL). English has been removed per spec.
const resources = {
  ar: { translation: ar },
  he: { translation: he },
};

export const SUPPORTED_LANGUAGES = ['ar', 'he'] as const;

export const LANGUAGE_DIR: Record<string, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  he: 'rtl',
};

export function applyDirection(lang: string) {
  const dir = LANGUAGE_DIR[lang] ?? 'rtl';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }
}

// Resolve the initial language strictly from localStorage; never from the
// browser navigator (which may be English). Default to Arabic.
function resolveInitialLanguage(): 'ar' | 'he' {
  if (typeof window === 'undefined') return 'ar';
  const stored = window.localStorage.getItem('language');
  if (stored === 'he') return 'he';
  // Normalize any stale/unsupported value (e.g. 'en') back to Arabic.
  if (stored !== 'ar') {
    window.localStorage.setItem('language', 'ar');
  }
  return 'ar';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'he'],
    nonExplicitSupportedLngs: false,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Only trust localStorage; do NOT fall back to navigator language.
      order: ['localStorage'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

// Final guard: if anything resolved to an unsupported language, force Arabic.
if (!SUPPORTED_LANGUAGES.includes(i18n.language as (typeof SUPPORTED_LANGUAGES)[number])) {
  i18n.changeLanguage('ar');
}

// Apply direction on initial load and whenever language changes
applyDirection(i18n.language || 'ar');
i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
});

export default i18n;
