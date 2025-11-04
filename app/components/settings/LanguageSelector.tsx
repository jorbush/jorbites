'use client';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import Dropdown from '@/app/components/utils/Dropdown';
import { FiChevronDown } from 'react-icons/fi';

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();

    const handleChangeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
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
                renderButton={(isOpen, _, selectedLabel) => (
                    <div
                        className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-neutral-100 focus:border-green-450 focus:ring-green-450 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                        <span className="text-sm">{selectedLabel}</span>
                        <FiChevronDown
                            size={14}
                            className={`transform transition-transform ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </div>
                )}
            />
        </div>
    );
};

export default LanguageSelector;
