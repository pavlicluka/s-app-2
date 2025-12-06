import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

console.log('🚀 i18n.ts - File loaded and started');

// Initialize i18n with HTTP backend to load translation files dynamically
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'sl', // Force Slovenian as default language
    fallbackLng: 'sl',
    debug: false,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      customLoad: async (lng: string, ns: string, url: string, options: any, callback: (err: any, data: any) => void) => {
        console.log('🔍 i18n: Loading translation file:', url);
        try {
          const response = await fetch(url);
          console.log('🔍 i18n: HTTP Response:', response.status, response.statusText);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.text();
          console.log('🔍 i18n: Raw data length:', data.length);
          console.log('🔍 i18n: First 200 chars:', data.substring(0, 200));
          callback(null, JSON.parse(data));
        } catch (error) {
          console.error('❌ i18n: Failed to load:', error);
          callback(error, null);
        }
      }
    },
    detection: {
      order: ['localStorage'], // Only check localStorage, ignore browser language
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    load: 'languageOnly',
    react: {
      useSuspense: false
    }
  });

// Listen for language changes to reload translations
i18n.on('languageChanged', (lng) => {
  console.log('🌍 i18n: Language changed to:', lng);
});

console.log('✅ i18n: Initialized with dynamic translation loading from files');

// Force Slovenian language if not set in localStorage
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'sl');
  i18n.changeLanguage('sl');
}

export default i18n;
