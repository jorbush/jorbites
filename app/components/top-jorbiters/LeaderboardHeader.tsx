'use client';

import { useTranslation } from 'react-i18next';
import React from 'react';
import { FcPositiveDynamic } from 'react-icons/fc';
import SectionHeader from '@/app/components/utils/SectionHeader';

const LeaderboardHeader: React.FC = () => {
    const { t } = useTranslation();
    return (
        <SectionHeader
            icon={FcPositiveDynamic}
            title="Top Jorbiters 👨‍🍳"
            description={t('top_jorbiters_description')}
        />
    );
};

export default LeaderboardHeader;
