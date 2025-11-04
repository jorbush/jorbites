'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import Dropdown from '@/app/components/utils/Dropdown';

interface Language {
    code: string;
    name: string;
}

const LANGUAGES: Language[] = [
    { code: 'es', name: 'Castellano' },
    { code: 'en', name: 'English' },
    { code: 'ca', name: 'Català' },
];

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const handleChangeLanguage = (selectedLanguage: string) => {
        i18n.changeLanguage(selectedLanguage);
    };

    const options = LANGUAGES.map((lang) => ({
        value: lang.code,
        label: lang.name,
    }));

    const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language);

    const buttonContent = (
        <span className="text-sm">{currentLanguage?.name || 'English'}</span>
    );

    return (
        <div
            className="relative inline-flex flex-col gap-2"
            data-cy="language-selector"
        >
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <Dropdown
                options={options}
                value={i18n.language}
                onChange={handleChangeLanguage}
                buttonContent={buttonContent}
                ariaLabel={t('select_your_language') || 'Select your language'}
                data-cy="language-dropdown"
            />
        </div>
    );
};

export default LanguageSelector;
