'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import Dropdown from '../utils/Dropdown';
import { FiChevronDown } from 'react-icons/fi';

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const handleChangeLanguage = (selectedLanguage: string) => {
        i18n.changeLanguage(selectedLanguage);
    };

    const languages = [
        { value: 'es', label: 'Castellano' },
        { value: 'en', label: 'English' },
        { value: 'ca', label: 'Català' },
    ];

    const currentLanguage =
        languages.find((lang) => lang.value === i18n.language)?.label ||
        'English';

    return (
        <div
            className="relative inline-flex"
            data-cy="language-selector"
        >
            <div className="flex-1">
                <p className="text-left">{t('select_your_language')}</p>
            </div>
            <Dropdown
                buttonAriaLabel={t('select_your_language') || 'Select Language'}
                buttonContent={
                    <div className="flex items-center gap-1">
                        <span className="text-sm">{currentLanguage}</span>
                        <FiChevronDown size={14} />
                    </div>
                }
            >
                {languages.map((lang) => (
                    <div
                        key={lang.value}
                        onClick={() => handleChangeLanguage(lang.value)}
                        className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                            i18n.language === lang.value
                                ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                    >
                        <span className="whitespace-nowrap">{lang.label}</span>
                    </div>
                ))}
            </Dropdown>
        </div>
    );
};

export default LanguageSelector;
