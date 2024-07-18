'use client';

import { useTranslation } from 'react-i18next';
import useTheme from '../hooks/useTheme';

const Footer = () => {
    const { t } = useTranslation();

    useTheme();

    return (
        <div className="flex w-full flex-col items-center justify-center p-4 text-neutral-200 dark:text-gray-600">
            <div>{`${t('version')} 0.5`}</div>
            <div>
                {`${t('contact')} jbonetv5@gmail.com`}
            </div>
        </div>
    );
};

export default Footer;
