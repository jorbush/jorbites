'use client';

import { useTranslation } from 'react-i18next';
import useTheme from '@/app/hooks/useTheme';
import Link from 'next/link';
import packageJson from '@/package.json';
const version = packageJson.version;

const Footer = () => {
    const { t } = useTranslation();
    useTheme();
    return (
        <div className="flex w-full flex-col items-center justify-center p-4 text-neutral-200 dark:text-gray-600">
            <div>{`${t('version')} ${version}`}</div>
            <div>{`${t('contact')}: jbonetv5@gmail.com`}</div>
            <div className="flex flex-row items-center space-x-4 space-y-0">
                <Link
                    href="/policies/privacy"
                    className="hover:underline"
                >
                    {t('privacy_policy')}
                </Link>
                <Link
                    href="/policies/cookies"
                    className="hover:underline"
                >
                    {t('cookies_policy')}
                </Link>
            </div>
        </div>
    );
};

export default Footer;
