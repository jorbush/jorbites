'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { useAds } from '@/app/providers/AdProvider';
import toast from 'react-hot-toast';

const VoluntarySupportToggle: React.FC = () => {
    const { showAds, setShowAds } = useAds();
    const { t } = useTranslation();

    const toggleAds = () => {
        const newValue = !showAds;
        setShowAds(newValue);
        
        if (newValue) {
            toast.success(t('thank_you_for_support') || 'Thank you for your support! ❤️', {
                duration: 3000,
            });
        }
    };

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('enable_ads_support')}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {t('enable_ads_support_description')}
                </p>
            </div>
            <ToggleSwitch
                checked={showAds}
                onChange={toggleAds}
                label=""
                dataCy="ads-toggle"
            />
        </div>
    );
};

export default VoluntarySupportToggle;
