'use client';

import { useTranslation } from 'react-i18next';
import React from 'react';
import { FcPositiveDynamic } from 'react-icons/fc';

const LeaderboardHeader: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                    <FcPositiveDynamic size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                        {t('top_jorbiters') || 'Top Jorbiters'}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t('top_jorbiters_description')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardHeader;
