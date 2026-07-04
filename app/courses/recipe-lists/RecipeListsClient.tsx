'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiShare2,
    FiHelpCircle,
    FiChevronRight,
    FiChevronLeft,
} from 'react-icons/fi';
import { PiListPlusBold } from 'react-icons/pi';
import { SafeUser } from '@/app/types';

import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CourseStepper from '@/app/components/courses/CourseStepper';
import CourseModule from '@/app/components/courses/CourseModule';
import CourseTest from '@/app/components/courses/CourseTest';
import CertificateGenerator from '@/app/components/courses/CertificateGenerator';
import { recipeListsQuestions } from './recipeListsQuestions';

interface RecipeListsClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'overview' | 'creation' | 'sharing' | 'test';

const MODULES_KEY = 'jorbites_course_recipe_lists_modules:v2';
const PROGRESS_KEY = 'jorbites_course_recipe_lists_progress:v2';

const RecipeListsClient: React.FC<RecipeListsClientProps> = ({
    currentUser,
}) => {
    const { t, i18n } = useTranslation();
    const currentLang = (i18n.language || 'en') as 'en' | 'es' | 'ca';

    const [activeStep, setActiveStep] = useState<StepId>('overview');

    // Checklist modules completed state
    const [completedModules, setCompletedModules] = useState<
        Record<string, boolean>
    >(() => {
        if (typeof window === 'undefined') return {};
        const stored = localStorage.getItem(MODULES_KEY);
        return stored ? JSON.parse(stored) : {};
    });

    const persistModules = useCallback((updated: Record<string, boolean>) => {
        localStorage.setItem(MODULES_KEY, JSON.stringify(updated));
        // Calculate progress percentage
        // Overview + Creation + Sharing + Test (if passed)
        const items = ['overview', 'creation', 'sharing', 'test'];
        const completedCount = items.filter((id) => updated[id]).length;
        const progressPercentage = Math.round(
            (completedCount / items.length) * 100
        );
        localStorage.setItem(PROGRESS_KEY, progressPercentage.toString());
    }, []);

    const markModuleCompleted = useCallback(
        (id: string) => {
            setCompletedModules((prev) => {
                const updated = { ...prev, [id]: true };
                persistModules(updated);
                return updated;
            });
        },
        [persistModules]
    );

    const isTestPassed = completedModules['test'];

    // 1. Overview Checklist State
    const [overviewChecked, setOverviewChecked] = useState({
        auto: false,
        custom: false,
        privacy: false,
        multi: false,
    });

    useEffect(() => {
        if (completedModules['overview']) {
            setOverviewChecked({
                auto: true,
                custom: true,
                privacy: true,
                multi: true,
            });
        }
    }, [completedModules]);

    const handleOverviewCheck = (key: keyof typeof overviewChecked) => {
        setOverviewChecked((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            const allChecked = Object.values(next).every((v) => v);
            if (allChecked) {
                markModuleCompleted('overview');
            }
            return next;
        });
    };

    // Steps list configuration
    const steps = [
        {
            id: 'overview',
            title: t('requirements'),
            icon: FiCheck,
            isCompleted: !!completedModules['overview'],
        },
        {
            id: 'creation',
            title: t('workflow'),
            icon: PiListPlusBold,
            isCompleted: !!completedModules['creation'],
        },
        {
            id: 'sharing',
            title: t('recipe_lists_course_details.sharing_title'),
            icon: FiShare2,
            isCompleted: !!completedModules['sharing'],
        },
        {
            id: 'test',
            title: t('final_test'),
            icon: FiHelpCircle,
            isCompleted: isTestPassed,
        },
    ];

    return (
        <Container>
            <div className="px-4 py-8">
                <SectionHeader
                    icon={FiBookOpen}
                    title={t('recipe_lists_course')}
                    description={t(
                        'recipe_lists_course_details.course_description'
                    )}
                />

                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Sidebar navigation */}
                    <div className="lg:col-span-1">
                        <CourseStepper
                            modules={steps}
                            activeModuleId={activeStep}
                            onSelectModule={(id) => setActiveStep(id as StepId)}
                        />
                    </div>

                    {/* Main content display panel */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* 1. Overview Checklist panel */}
                        {activeStep === 'overview' && (
                            <CourseModule
                                title={t(
                                    'recipe_lists_course_details.requirements_title'
                                )}
                                isOpen={activeStep === 'overview'}
                                onToggle={() => {}}
                                isCompleted={!!completedModules['overview']}
                                icon={FiCheck}
                            >
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.req_auto_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.req_auto_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.req_custom_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.req_custom_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.req_privacy_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.req_privacy_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.req_multi_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.req_multi_desc'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800/30">
                                        <h4 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                            {t(
                                                'recipe_lists_course_details.action_required'
                                            )}
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.auto
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'auto'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'recipe_lists_course_details.checklist_auto'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.custom
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'custom'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'recipe_lists_course_details.checklist_custom'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.privacy
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'privacy'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'recipe_lists_course_details.checklist_privacy'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.multi
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'multi'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'recipe_lists_course_details.checklist_multi'
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveStep('creation')
                                            }
                                            disabled={
                                                !completedModules['overview']
                                            }
                                            className="flex items-center gap-1 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                        >
                                            Next Step
                                            <FiChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </CourseModule>
                        )}

                        {/* 2. Creation walkthrough panel */}
                        {activeStep === 'creation' && (
                            <CourseModule
                                title={t(
                                    'recipe_lists_course_details.workflow_title'
                                )}
                                isOpen={activeStep === 'creation'}
                                onToggle={() => {}}
                                isCompleted={!!completedModules['creation']}
                                icon={PiListPlusBold}
                            >
                                <div className="space-y-6">
                                    <div className="dark:border-neutral-850 relative space-y-8 border-l-2 border-neutral-200 pl-6">
                                        {/* Step 1 */}
                                        <div className="relative">
                                            <div className="bg-green-550 absolute top-0.5 -left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold text-neutral-950">
                                                1
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step1_title'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step1_desc'
                                                )}
                                            </p>
                                        </div>
                                        {/* Step 2 */}
                                        <div className="relative">
                                            <div className="bg-green-550 absolute top-0.5 -left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold text-neutral-950">
                                                2
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step2_title'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step2_desc'
                                                )}
                                            </p>
                                        </div>
                                        {/* Step 3 */}
                                        <div className="relative">
                                            <div className="bg-green-550 absolute top-0.5 -left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold text-neutral-950">
                                                3
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step3_title'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step3_desc'
                                                )}
                                            </p>
                                        </div>
                                        {/* Step 4 */}
                                        <div className="relative">
                                            <div className="bg-green-550 absolute top-0.5 -left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold text-neutral-950">
                                                4
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step4_title'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step4_desc'
                                                )}
                                            </p>
                                        </div>
                                        {/* Step 5 */}
                                        <div className="relative">
                                            <div className="bg-green-550 absolute top-0.5 -left-[35px] flex size-6 items-center justify-center rounded-full text-xs font-bold text-neutral-950">
                                                5
                                            </div>
                                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step5_title'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'recipe_lists_course_details.workflow_step5_desc'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveStep('overview')
                                            }
                                            className="flex items-center gap-1 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            <FiChevronLeft className="size-4" />
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                markModuleCompleted('creation');
                                                setActiveStep('sharing');
                                            }}
                                            className="flex items-center gap-1 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                        >
                                            Next Step
                                            <FiChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </CourseModule>
                        )}

                        {/* 3. Sharing panel */}
                        {activeStep === 'sharing' && (
                            <CourseModule
                                title={t(
                                    'recipe_lists_course_details.sharing_title'
                                )}
                                isOpen={activeStep === 'sharing'}
                                onToggle={() => {}}
                                isCompleted={!!completedModules['sharing']}
                                icon={FiShare2}
                            >
                                <div className="space-y-6">
                                    <div className="border-neutral-150 rounded-xl border bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                            {t(
                                                'recipe_lists_course_details.sharing_desc1'
                                            )}
                                        </p>
                                        <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                            {t(
                                                'recipe_lists_course_details.sharing_desc2'
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveStep('creation')
                                            }
                                            className="flex items-center gap-1 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            <FiChevronLeft className="size-4" />
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                markModuleCompleted('sharing');
                                                setActiveStep('test');
                                            }}
                                            className="flex items-center gap-1 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                        >
                                            Go to Quiz
                                            <FiChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </CourseModule>
                        )}

                        {/* 4. Quiz panel */}
                        {activeStep === 'test' && (
                            <div className="space-y-6">
                                {!isTestPassed ? (
                                    <CourseTest
                                        questions={recipeListsQuestions}
                                        currentLang={currentLang}
                                        onPass={() =>
                                            markModuleCompleted('test')
                                        }
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-green-200 bg-green-50/20 p-6 text-center dark:border-green-950/20 dark:bg-green-950/5">
                                            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                                <FiAward className="size-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {t('pass_message')}
                                            </h3>
                                        </div>

                                        <CertificateGenerator
                                            courseTitle="Recipe Lists Certificate"
                                            currentUserNames={currentUser?.name}
                                            badgePath="/badges/recipe_lists_badge.jpg"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default RecipeListsClient;
