import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Lang } from '../game/types';
import en from './en.json';

export const LANGUAGES: { id: Lang; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
];

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function applyLanguage(_lang: Lang): void {
  if (i18n.language !== 'en') void i18n.changeLanguage('en');
  try {
    document.documentElement.lang = 'en';
  } catch {
    /* non-browser tests */
  }
}

export default i18n;
