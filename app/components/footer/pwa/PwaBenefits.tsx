'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSmartphone, FiZap, FiBell } from 'react-icons/fi';

const PwaBenefits: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-200/60 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
                <FiSmartphone className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>{t('footer_pwa_benefit_standalone')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <FiZap className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>{t('footer_pwa_benefit_offline')}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <FiBell className="size-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>{t('footer_pwa_benefit_notifications')}</span>
            </div>
        </div>
    );
};

export default PwaBenefits;
