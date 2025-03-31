'use client';

import { useTranslation } from 'react-i18next';
import React from 'react';

const LeaderboardHeader: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold sm:text-4xl dark:text-white">
                Top Jorbiters 👨‍🍳
            </h1>
            <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                {t('top_jorbiters_description')}
            </p>
        </div>
    );
};

export default LeaderboardHeader;
