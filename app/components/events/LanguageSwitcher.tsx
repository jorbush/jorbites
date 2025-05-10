'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const router = useRouter();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'ca', name: 'Català' },
    ];

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);

        // Navigate to the same path to refresh content
        router.refresh();
    };

    return (
        <div className="mb-6 flex flex-row gap-4 dark:text-neutral-100">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`rounded-md px-3 py-1 text-sm ${
                        i18n.language === lang.code
                            ? 'bg-green-450 font-medium text-black'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
