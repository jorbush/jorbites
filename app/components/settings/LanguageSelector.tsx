'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const handleChangeLanguage = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
    };

    return (
        <div className="relative inline-flex">
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <select
                value={i18n.language}
                onChange={handleChangeLanguage}
                className="rounded-md border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm focus:border-green-450 focus:ring-green-450"
            >
                <option value="es">Castellano</option>
                <option value="en">English</option>
                <option value="ca">Català</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
