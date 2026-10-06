import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiBookOpen,
    FiUserPlus,
    FiShield,
    FiLock,
    FiRefreshCw,
    FiAward,
} from 'react-icons/fi';

export const DRAFTS_STEP_IDS = [
    'requirements',
    'workflow',
    'invites',
    'roles',
    'locking',
    'sync',
    'test',
] as const;

export type StepId = (typeof DRAFTS_STEP_IDS)[number];

export function useDraftsSteps(
    completedModules: Record<string, boolean>,
    isTestPassed: boolean
) {
    const { t } = useTranslation();

    return useMemo(
        () => [
            {
                id: 'requirements',
                title: t('requirements') || 'Requirements',
                icon: FiCheck,
                isCompleted: !!completedModules['requirements'],
            },
            {
                id: 'workflow',
                title: t('workflow') || 'Workflow',
                icon: FiBookOpen,
                isCompleted: !!completedModules['workflow'],
            },
            {
                id: 'invites',
                title:
                    t('drafts_course_details.step_invites') || 'Invites & Team',
                icon: FiUserPlus,
                isCompleted: !!completedModules['invites'],
            },
            {
                id: 'roles',
                title: t('drafts_course_details.step_roles') || 'Chef Roles',
                icon: FiShield,
                isCompleted: !!completedModules['roles'],
            },
            {
                id: 'locking',
                title:
                    t('drafts_course_details.step_locking') || 'Step Locking',
                icon: FiLock,
                isCompleted: !!completedModules['locking'],
            },
            {
                id: 'sync',
                title: t('drafts_course_details.step_sync') || 'Live Sync',
                icon: FiRefreshCw,
                isCompleted: !!completedModules['sync'],
            },
            {
                id: 'test',
                title: t('final_test') || 'Final Test',
                icon: FiAward,
                isCompleted: isTestPassed,
            },
        ],
        [t, completedModules, isTestPassed]
    );
}
