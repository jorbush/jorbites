'use client';

import { useTranslation } from 'react-i18next';
import useTheme from '@/app/hooks/useTheme';
import Link from 'next/link';
import packageJson from '@/package.json';

const Footer = () => {
    const { t } = useTranslation();
    useTheme();

    return (
        <footer className="w-full p-4 text-neutral-500 dark:text-gray-600">
            <div className="flex flex-col items-center justify-center">
                <div aria-label="Version information">{`${t('version')} ${packageJson.version}`}</div>
                <div aria-label="Contact information">
                    <span>{t('contact')}: </span>
                    <a
                        href="mailto:jbonetv5@gmail.com"
                        className="hover:underline"
                    >
                        jbonetv5@gmail.com
                    </a>
                </div>
                <nav aria-label="Legal links">
                    <ul className="flex flex-row items-center space-x-4 space-y-0">
                        <li>
                            <Link
                                href="/policies/privacy"
                                className="hover:underline"
                            >
                                {t('privacy_policy')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/policies/cookies"
                                className="hover:underline"
                            >
                                {t('cookies_policy')}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
