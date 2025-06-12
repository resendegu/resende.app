import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pt from './locales/pt.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
};

const getBrowserLanguage = () => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('lang');
    if (storedLang && (storedLang === 'en' || storedLang === 'pt')) {
      return storedLang;
    }
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language || (navigator.languages && navigator.languages[0]);
      if (lang && lang.startsWith('pt')) return 'pt';
    }
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Listen for language changes and store in localStorage
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('lang', lng);
  });
}

export default i18n;
