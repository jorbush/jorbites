import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiSliders,
    FiList,
} from 'react-icons/fi';

export const RECIPE_BOOK_STEP_IDS = [
    'requirements',
    'workflow',
    'styles',
    'selection',
    'test',
] as const;

export type StepId = (typeof RECIPE_BOOK_STEP_IDS)[number];

export function useRecipeBookSteps(
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
                id: 'styles',
                title:
                    t('recipe_book_course_details.req_styles_label') ||
                    'Styles',
                icon: FiSliders,
                isCompleted: !!completedModules['styles'],
            },
            {
                id: 'selection',
                title:
                    t('recipe_book_course_details.req_selection_label') ||
                    'Selection',
                icon: FiList,
                isCompleted: !!completedModules['selection'],
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
