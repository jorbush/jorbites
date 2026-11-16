'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { IoBookmarkOutline, IoFlameOutline } from 'react-icons/io5';
import { SafeUser } from '@/app/types';
import PreferenceCard from '@/app/components/stats/PreferenceCard';
import { resolvePreferenceDisplay } from '@/app/components/stats/userStatsUtils';

export interface CookingPreferencesSectionProps {
    user: SafeUser;
}

const CookingPreferencesSection: React.FC<CookingPreferencesSectionProps> = ({
    user,
}) => {
    const { t } = useTranslation();

    const categoryDisplay = resolvePreferenceDisplay(
        user.mostUsedCategory,
        (key) => String(t(key))
    );

    const methodDisplay = resolvePreferenceDisplay(user.mostUsedMethod, (key) =>
        String(t(key))
    );

    return (
        <div>
            <h2 className="mt-8 mb-3 px-1 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl dark:text-neutral-100">
                {String(t('cooking_preferences'))}
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <PreferenceCard
                    title={String(t('most_used_category'))}
                    value={categoryDisplay}
                    icon={<IoBookmarkOutline />}
                />

                <PreferenceCard
                    title={String(t('most_used_method'))}
                    value={methodDisplay}
                    icon={<IoFlameOutline />}
                />
            </div>
        </div>
    );
};

export default CookingPreferencesSection;
