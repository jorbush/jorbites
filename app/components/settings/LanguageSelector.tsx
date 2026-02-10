'use client';

import { useTranslation } from 'react-i18next';
import i18n from '@/app/i18n';
import Dropdown from '@/app/components/utils/Dropdown';
import { SafeUser } from '@/app/types';

interface Language {
    code: string;
    name: string;
}

const LANGUAGES: Language[] = [
    { code: 'es', name: 'Castellano' },
    { code: 'en', name: 'English' },
    { code: 'ca', name: 'Català' },
];

interface LanguageSelectorProps {
    currentUser?: SafeUser | null;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentUser }) => {
    const { t } = useTranslation();

    const handleChangeLanguage = (selectedLanguage: string) => {
        i18n.changeLanguage(selectedLanguage);
        if (currentUser) {
            fetch('/api/user/language', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: selectedLanguage,
                }),
            });
        }
    };

    const options = LANGUAGES.map((lang) => ({
        value: lang.code,
        label: lang.name,
    }));

    const currentLanguage = LANGUAGES.find(
        (lang) => lang.code === i18n.language
    );

    const buttonContent = (
        <span className="text-sm">{currentLanguage?.name || 'English'}</span>
    );

    return (
        <div
            className="flex items-center"
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
