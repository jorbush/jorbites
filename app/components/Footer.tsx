'use client';

import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";


const Footer = () => {
    const { t } = useTranslation();

    useTheme()

    return (
        <div className="
            flex
            flex-col
            w-full
            justify-center
            items-center
            text-neutral-200
            dark:text-gray-600
            p-4
        ">
            <div>
                {`${t('version')} 0.5`}
            </div>
            <div>
                {`${t('contact')} jbonetv5@gmail.com`}
            </div>
        </div>
    );
}

export default Footer