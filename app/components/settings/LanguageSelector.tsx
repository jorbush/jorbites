'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import Dropdown from '../utils/Dropdown';

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const handleChangeLanguage = (selectedLanguage: string) => {
        i18n.changeLanguage(selectedLanguage);
    };

    const languageOptions = [
        { value: 'es', label: 'Castellano' },
        { value: 'en', label: 'English' },
        { value: 'ca', label: 'Català' },
    ];

    return (
        <div
            className="relative inline-flex items-center"
            data-cy="language-selector"
        >
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <Dropdown
                options={languageOptions}
                value={i18n.language}
                onChange={handleChangeLanguage}
                ariaLabel={t('select_your_language') || 'Select your language'}
                buttonClassName="rounded-md border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-xs focus:border-green-450 focus:ring-green-450"
            />
        </div>
    );
};

export default LanguageSelector;
