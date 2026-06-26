// This module MUST be imported BEFORE the i18n config so that any stale
// localStorage value (e.g. an old 'en' from a previous build) is normalized
// to a supported language ('ar' | 'he') prior to i18next initialization.
// ES module imports are hoisted and evaluated in order, so importing this
// first guarantees the cleanup happens before i18n reads localStorage.
(function normalizeStoredLanguage() {
  if (typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem('language');
    if (stored !== 'ar' && stored !== 'he') {
      window.localStorage.setItem('language', 'ar');
    }
  } catch {
    // localStorage may be unavailable (private mode); ignore.
  }
  if (typeof document !== 'undefined') {
    const lang = window.localStorage.getItem('language') || 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = 'rtl';
  }
})();
