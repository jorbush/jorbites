import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiFileText,
    FiSave,
} from 'react-icons/fi';

export const RECIPE_CREATOR_STEP_IDS = [
    'requirements',
    'workflow',
    'plaintext',
    'drafts',
    'test',
] as const;

export type StepId = (typeof RECIPE_CREATOR_STEP_IDS)[number];

export function useRecipeCreatorSteps(
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
                id: 'plaintext',
                title:
                    t('recipe_creator_course_details.req_plaintext_label') ||
                    'Plain Text Mode',
                icon: FiFileText,
                isCompleted: !!completedModules['plaintext'],
            },
            {
                id: 'drafts',
                title:
                    t('recipe_creator_course_details.req_draft_label') ||
                    'Drafts & Edits',
                icon: FiSave,
                isCompleted: !!completedModules['drafts'],
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
