'use client';

import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";


const Footer = () => {
    const { t } = useTranslation();

    useTheme()

    return (
        <div className="
            flex
            flex-row
            w-full
            justify-center
            items-center
            text-neutral-200
            dark:text-gray-600
            p-4
        ">
            {`${t('version')} 0.4`}
        </div>
    );
}

export default Footer