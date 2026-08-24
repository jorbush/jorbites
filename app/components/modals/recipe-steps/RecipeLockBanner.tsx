'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface RecipeLockBannerProps {
    isCurrentStepLocked: boolean;
    lockOwner?: { userName?: string; userId?: string } | null;
    isSharedSession: boolean;
    otherActiveLocks: Array<[string, any]>;
}

const RecipeLockBanner: React.FC<RecipeLockBannerProps> = ({
    isCurrentStepLocked,
    lockOwner,
    isSharedSession,
    otherActiveLocks,
}) => {
    const { t } = useTranslation();

    if (isCurrentStepLocked && lockOwner) {
        return (
            <div
                data-testid="lock-banner"
                className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
            >
                <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                </span>
                <span>
                    {lockOwner.userName
                        ? t('lock_step_editing', {
                              userName: lockOwner.userName,
                          }) ||
                          `@${lockOwner.userName} is currently editing this step`
                        : t('lock_step_editing_generic') ||
                          'A co-cook is currently editing this step'}
                </span>
            </div>
        );
    }

    if (isSharedSession && otherActiveLocks.length > 0) {
        return (
            <div
                data-testid="co-cook-activity-banner"
                className="border-green-450/20 bg-green-450/10 dark:border-green-450/20 dark:bg-green-450/10 mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium text-green-800 dark:text-green-300"
            >
                <span className="relative flex size-2 shrink-0">
                    <span className="bg-green-450 absolute inline-flex size-full animate-ping rounded-full opacity-75"></span>
                    <span className="bg-green-450 relative inline-flex size-2 rounded-full"></span>
                </span>
                <span>
                    {otherActiveLocks[0][1]?.userName
                        ? t('co_cook_active_other_step', {
                              userName: otherActiveLocks[0][1].userName,
                          }) ||
                          `@${otherActiveLocks[0][1].userName} is currently editing another step`
                        : t('co_cook_active_other_step_generic') ||
                          'A co-cook is currently editing another step'}
                </span>
            </div>
        );
    }

    return null;
};

export default RecipeLockBanner;
