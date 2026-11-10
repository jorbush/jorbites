import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiCheckCircle,
    FiSettings,
    FiSmartphone,
} from 'react-icons/fi';

export const JORBITES_BASICS_STEP_IDS = [
    'requirements',
    'workflow',
    'interactions',
    'settings',
    'pwa',
    'test',
] as const;

export type StepId = (typeof JORBITES_BASICS_STEP_IDS)[number];

export function useJorbitesBasicsSteps(
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
                id: 'interactions',
                title:
                    t(
                        'jorbites_basics_course_details.req_interactions_label'
                    ) || 'Interactions',
                icon: FiCheckCircle,
                isCompleted: !!completedModules['interactions'],
            },
            {
                id: 'settings',
                title: t('settings') || 'Settings & Theme',
                icon: FiSettings,
                isCompleted: !!completedModules['settings'],
            },
            {
                id: 'pwa',
                title:
                    t('jorbites_basics_course_details.pwa_info_title') ||
                    'PWA App & Notifications',
                icon: FiSmartphone,
                isCompleted: !!completedModules['pwa'],
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
