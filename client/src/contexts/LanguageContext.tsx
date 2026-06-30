import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'ar' | 'he';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: Direction;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return stored === 'he' ? 'he' : 'ar';
  });

  // Both Hebrew and Arabic are RTL
  const direction: Direction = 'rtl';
  const isRTL = true;

  useEffect(() => {
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;

    // Update i18n language
    i18n.changeLanguage(language);

    // Save to localStorage
    localStorage.setItem('language', language);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language, direction } }));
  }, [language, direction, i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, direction, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
