import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiUserPlus,
    FiLock,
} from 'react-icons/fi';

export const WORKSHOPS_STEP_IDS = [
    'requirements',
    'workflow',
    'whitelist',
    'approvals',
    'test',
] as const;

export type StepId = (typeof WORKSHOPS_STEP_IDS)[number];

export function useWorkshopsSteps(
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
                id: 'whitelist',
                title: t('workshop_whitelist') || 'Invited Users',
                icon: FiUserPlus,
                isCompleted: !!completedModules['whitelist'],
            },
            {
                id: 'approvals',
                title: t('workshop_details') || 'Workshop Details',
                icon: FiLock,
                isCompleted: !!completedModules['approvals'],
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
