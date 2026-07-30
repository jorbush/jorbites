'use client';

import React, {
    useState,
    useEffect,
    useTransition,
    useMemo,
    useOptimistic,
} from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import {
    FiHeart,
    FiBookOpen,
    FiCalendar,
    FiTarget,
    FiCheckSquare,
    FiAward,
} from 'react-icons/fi';

interface NotificationPreferencesManagerProps {
    currentUser?: SafeUser | null;
}

export type PreferenceCategory =
    | 'social'
    | 'newContent'
    | 'eventsAndChallenges'
    | 'quests'
    | 'voting'
    | 'achievements';

const CATEGORIES: {
    key: PreferenceCategory;
    labelKey: string;
    icon: React.ElementType;
}[] = [
    { key: 'social', labelKey: 'notification_social', icon: FiHeart },
    {
        key: 'newContent',
        labelKey: 'notification_new_content',
        icon: FiBookOpen,
    },
    {
        key: 'eventsAndChallenges',
        labelKey: 'notification_events_challenges',
        icon: FiCalendar,
    },
    { key: 'quests', labelKey: 'notification_quests', icon: FiTarget },
    { key: 'voting', labelKey: 'notification_voting', icon: FiCheckSquare },
    {
        key: 'achievements',
        labelKey: 'notification_achievements',
        icon: FiAward,
    },
];

const NotificationPreferencesManager: React.FC<
    NotificationPreferencesManagerProps
> = ({ currentUser }) => {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();
    const [updatingKey, setUpdatingKey] = useState<PreferenceCategory | null>(
        null
    );
    const [isPushSubscribed, setIsPushSubscribed] = useState(false);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            'PushManager' in window
        ) {
            navigator.serviceWorker.ready
                .then((registration) =>
                    registration.pushManager.getSubscription()
                )
                .then((sub) => {
                    setIsPushSubscribed(!!sub);
                })
                .catch(() => {
                    setIsPushSubscribed(false);
                });
        }
    }, []);

    const basePreferences = useMemo<Record<PreferenceCategory, boolean>>(() => {
        const prefs = currentUser?.notificationPreferences || {};
        return {
            social: prefs.social ?? true,
            newContent: prefs.newContent ?? true,
            eventsAndChallenges: prefs.eventsAndChallenges ?? true,
            quests: prefs.quests ?? true,
            voting: prefs.voting ?? true,
            achievements: prefs.achievements ?? true,
        };
    }, [currentUser?.notificationPreferences]);

    const [optimisticPreferences, setOptimisticPreferences] = useOptimistic(
        basePreferences,
        (state, update: { key: PreferenceCategory; value: boolean }) => ({
            ...state,
            [update.key]: update.value,
        })
    );

    const isMasterEnabled =
        !!currentUser?.emailNotifications || isPushSubscribed;

    const handleToggle = (key: PreferenceCategory) => {
        if (!isMasterEnabled || isPending || updatingKey !== null) return;

        const newValue = !optimisticPreferences[key];
        setUpdatingKey(key);

        startTransition(async () => {
            setOptimisticPreferences({ key, value: newValue });
            try {
                await axios.patch('/api/notificationPreferences', {
                    [key]: newValue,
                });
                toast.success(t('notification_preferences_updated'));
                refresh?.();
            } catch {
                toast.error(t('something_went_wrong'));
            } finally {
                setUpdatingKey(null);
            }
        });
    };

    if (!isMasterEnabled) {
        return null;
    }

    return (
        <div
            className="flex flex-col gap-3 border-t border-neutral-200 pt-2 dark:border-neutral-700"
            data-cy="notification-preferences-manager"
        >
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {t('notification_preferences_title')}
            </p>
            <div className="flex flex-col gap-3 pl-2">
                {CATEGORIES.map(({ key, labelKey, icon: Icon }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-2"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Icon className="size-4 shrink-0 text-neutral-500" />
                            <span className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                                {t(labelKey)}
                            </span>
                        </div>
                        <ToggleSwitch
                            checked={optimisticPreferences[key]}
                            onChange={() => handleToggle(key)}
                            label=""
                            dataCy={`pref-toggle-${key}`}
                            disabled={isPending || updatingKey === key}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPreferencesManager;
