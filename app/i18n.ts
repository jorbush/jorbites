import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', // Idioma por defecto
    supportedLngs: ['es', 'en', 'ca'], // Idiomas soportados
    detection: {
      order: ['localStorage', 'navigator'], // Prioridad del detector de idioma
      caches: ['localStorage'], // Caché utilizada
    },
    interpolation: {
      escapeValue: false, // No escapar valores HTML
    },
  });

export default i18n;
