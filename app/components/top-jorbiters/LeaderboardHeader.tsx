'use client';

import { useTranslation } from 'react-i18next';
import React from 'react';
import { FcPositiveDynamic } from 'react-icons/fc';

const LeaderboardHeader: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-10 text-center">
            <h1 className="mb-3 flex items-center justify-center text-3xl font-bold sm:text-4xl dark:text-white">
                <FcPositiveDynamic className="mr-2 text-3xl sm:text-4xl" />
                Top Jorbiters 👨‍🍳
            </h1>
            <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                {t('top_jorbiters_description')}
            </p>
        </div>
    );
};

export default LeaderboardHeader;
