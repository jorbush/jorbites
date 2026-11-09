import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiCalendar,
    FiDownload,
} from 'react-icons/fi';

export const MEAL_PLANNER_STEP_IDS = [
    'requirements',
    'workflow',
    'slots',
    'exports',
    'test',
] as const;

export type StepId = (typeof MEAL_PLANNER_STEP_IDS)[number];

export function useMealPlannerSteps(
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
                id: 'slots',
                title: t('meals') || 'Diet Slots',
                icon: FiCalendar,
                isCompleted: !!completedModules['slots'],
            },
            {
                id: 'exports',
                title: t('calendar_alerts') || 'Sync & Lists',
                icon: FiDownload,
                isCompleted: !!completedModules['exports'],
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
