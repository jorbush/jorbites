'use client';

import React, { useState, useTransition, useMemo, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { FiBookOpen, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { DEFAULT_PROFILE_PREFERENCES } from '@/app/utils/profile-utils';

interface ProfilePreferencesFormProps {
    currentUser?: SafeUser | null;
}

export type ProfilePreferenceCategory =
    | 'showStats'
    | 'showActivityGraph'
    | 'showArticles';

const PREFERENCE_CONFIG: {
    key: ProfilePreferenceCategory;
    labelKey: string;
    descKey: string;
    icon: React.ElementType;
}[] = [
    {
        key: 'showStats',
        labelKey: 'display_cooking_statistics',
        descKey: 'display_cooking_statistics_desc',
        icon: FiBarChart2,
    },
    {
        key: 'showActivityGraph',
        labelKey: 'display_activity_graph',
        descKey: 'display_activity_graph_desc',
        icon: FiCalendar,
    },
    {
        key: 'showArticles',
        labelKey: 'display_authored_articles',
        descKey: 'display_authored_articles_desc',
        icon: FiBookOpen,
    },
];

const ProfilePreferencesForm: React.FC<ProfilePreferencesFormProps> = ({
    currentUser,
}) => {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();
    const [updatingKey, setUpdatingKey] =
        useState<ProfilePreferenceCategory | null>(null);

    const basePreferences = useMemo<
        Record<ProfilePreferenceCategory, boolean>
    >(() => {
        const prefs = currentUser?.profilePreferences || {};
        return {
            showStats: prefs.showStats ?? DEFAULT_PROFILE_PREFERENCES.showStats,
            showActivityGraph:
                prefs.showActivityGraph ??
                DEFAULT_PROFILE_PREFERENCES.showActivityGraph,
            showArticles:
                prefs.showArticles ?? DEFAULT_PROFILE_PREFERENCES.showArticles,
        };
    }, [currentUser?.profilePreferences]);

    const [optimisticPreferences, setOptimisticPreferences] = useOptimistic(
        basePreferences,
        (
            state,
            update: { key: ProfilePreferenceCategory; value: boolean }
        ) => ({
            ...state,
            [update.key]: update.value,
        })
    );

    const handleToggle = (key: ProfilePreferenceCategory) => {
        if (!currentUser || isPending || updatingKey !== null) return;

        const newValue = !optimisticPreferences[key];
        setUpdatingKey(key);

        startTransition(async () => {
            setOptimisticPreferences({ key, value: newValue });
            try {
                await axios.patch('/api/profilePreferences', {
                    [key]: newValue,
                });
                toast.success(
                    t('profile_preferences_updated') ||
                        'Profile display preferences updated'
                );
                refresh?.();
            } catch {
                toast.error(
                    t('something_went_wrong') || 'Something went wrong'
                );
            } finally {
                setUpdatingKey(null);
            }
        });
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div
            className="flex flex-col gap-3 border-t border-neutral-200 pt-2 dark:border-neutral-700"
            data-cy="profile-preferences-form"
            data-testid="profile-preferences-form"
        >
            <div>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {t('profile_display_preferences') ||
                        'Profile Display Preferences'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('profile_display_preferences_desc') ||
                        'Customize what is visible on your public profile'}
                </p>
            </div>
            <div className="flex flex-col gap-3 pl-2">
                {PREFERENCE_CONFIG.map(
                    ({ key, labelKey, descKey, icon: Icon }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-3"
                            data-testid={`profile-preference-row-${key}`}
                        >
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                                <Icon className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                                <div className="flex flex-col">
                                    <span className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {t(labelKey)}
                                    </span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {t(descKey)}
                                    </span>
                                </div>
                            </div>
                            <ToggleSwitch
                                checked={optimisticPreferences[key]}
                                onChange={() => handleToggle(key)}
                                label=""
                                dataCy={`pref-toggle-${key}`}
                                disabled={isPending || updatingKey === key}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ProfilePreferencesForm;
