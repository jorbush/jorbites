'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import Dropdown, { DropdownOption } from '@/app/components/utils/Dropdown';

const LANGUAGE_OPTIONS: DropdownOption[] = [
    { value: 'es', label: 'Castellano' },
    { value: 'en', label: 'English' },
    { value: 'ca', label: 'Català' },
];

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const currentLanguage = i18n.language || LANGUAGE_OPTIONS[0].value;

    const handleLanguageChange = (languageValue: string) => {
        i18n.changeLanguage(languageValue);
    };

    return (
        <div
            className="relative inline-flex flex-col gap-2"
            data-cy="language-selector"
        >
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <Dropdown
                options={LANGUAGE_OPTIONS}
                value={currentLanguage}
                onChange={handleLanguageChange}
                ariaLabel={t('select_your_language') || 'Select your language'}
                dataCy="language-dropdown"
            />
        </div>
    );
};

export default LanguageSelector;
