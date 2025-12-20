import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only initialize with client-side plugins to prevent SSR timeout
if (typeof window !== 'undefined') {
    // Dynamic imports for client-side only
    const Backend = require('i18next-http-backend');
    const LanguageDetector = require('i18next-browser-languagedetector');

    // Handle both default and named exports
    const BackendModule = Backend.default || Backend;
    const DetectorModule = LanguageDetector.default || LanguageDetector;

    i18n.use(BackendModule)
        .use(DetectorModule)
        .use(initReactI18next)
        .init({
            fallbackLng: 'es',
            supportedLngs: ['es', 'en', 'ca'],
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
            },
            interpolation: {
                escapeValue: false,
            },
        });
} else {
    // Server-side: minimal initialization without HTTP backend
    i18n.use(initReactI18next).init({
        fallbackLng: 'es',
        supportedLngs: ['es', 'en', 'ca'],
        interpolation: {
            escapeValue: false,
        },
        // Disable resource loading on server-side
        initImmediate: false,
    });
}

export default i18n;
