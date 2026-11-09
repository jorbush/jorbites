import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiAward, FiBookOpen, FiLink, FiClock } from 'react-icons/fi';

export const QUESTS_STEP_IDS = [
    'requirements',
    'workflow',
    'linking',
    'statuses',
    'test',
] as const;

export type StepId = (typeof QUESTS_STEP_IDS)[number];

export function useQuestsSteps(
    completedModules: Record<string, boolean>,
    isTestPassed: boolean
) {
    const { t } = useTranslation();

    return useMemo(
        () => [
            {
                id: 'requirements',
                title: t('requirements'),
                icon: FiCheck,
                isCompleted: !!completedModules['requirements'],
            },
            {
                id: 'workflow',
                title: t('workflow'),
                icon: FiBookOpen,
                isCompleted: !!completedModules['workflow'],
            },
            {
                id: 'linking',
                title: t('linking') || 'Linking',
                icon: FiLink,
                isCompleted: !!completedModules['linking'],
            },
            {
                id: 'statuses',
                title: t('status') || 'Status',
                icon: FiClock,
                isCompleted: !!completedModules['statuses'],
            },
            {
                id: 'test',
                title: t('final_test'),
                icon: FiAward,
                isCompleted: isTestPassed,
            },
        ],
        [t, completedModules, isTestPassed]
    );
}
