"use client";

import { useTranslation } from 'react-i18next';
import i18n from '../../app/i18n';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();

  const handleChangeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <div className="relative inline-flex">
      <select
        value={i18n.language}
        onChange={handleChangeLanguage}
        className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-gray-700 bg-white"
      >
        <option value="es">Castellano</option>
        <option value="en">English</option>
        <option value="ca">Català</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
