import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)          // Charge /locales/{{lng}}.json au runtime
  .use(LanguageDetector)     // Lit localStorage 'lang' puis navigator.language
  .use(initReactI18next)
  .init({
    react: {
      useSuspense: true,
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'es'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      // public/locales/ est copié verbatim dans dist/locales/ par Vite publicDir
      loadPath: '/locales/{{lng}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React échappe déjà
      // Les fichiers locales utilisent {param} (une seule accolade)
      prefix: '{',
      suffix: '}',
    },
  });

export default i18n;
