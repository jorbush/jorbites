'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiShare2,
    FiHelpCircle,
    FiChevronLeft,
    FiCalendar,
} from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import toast from 'react-hot-toast';

import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CourseStepper from '@/app/components/courses/CourseStepper';
import CourseTest from '@/app/components/courses/CourseTest';
import CertificateGenerator from '@/app/components/courses/CertificateGenerator';
import Button from '@/app/components/buttons/Button';
import { communityEventsQuestions } from './communityEventsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CommunityEventsClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'overview' | 'challenges' | 'voting' | 'test';

const MODULES_KEY = 'jorbites_course_community_events_modules:v2';
const PROGRESS_KEY = 'jorbites_course_community_events_progress:v2';

const CommunityEventsClient: React.FC<CommunityEventsClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isMounted = useIsMounted();

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
        const items = ['overview', 'challenges', 'voting', 'test'];
        const completedCount = items.filter((id) => updated[id]).length;
        const progressPercentage = Math.round(
            (completedCount / items.length) * 100
        );
        localStorage.setItem(PROGRESS_KEY, progressPercentage.toString());
    }, []);

    const markModuleCompleted = useCallback(
        (id: string) => {
            if (completedModules[id]) return;
            setCompletedModules((prev) => {
                const updated = { ...prev, [id]: true };
                persistModules(updated);
                return updated;
            });
            toast.success('Module completed!');
        },
        [completedModules, persistModules]
    );

    const isTestPassed = completedModules['test'];

    // 1. Overview Checklist State
    const [overviewChecked, setOverviewChecked] = useState({
        challenge: false,
        contest: false,
        calendar: false,
        voting: false,
    });

    useEffect(() => {
        if (completedModules['overview']) {
            setOverviewChecked({
                challenge: true,
                contest: true,
                calendar: true,
                voting: true,
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

    // Challenges Walkthrough step
    const [challengesStep, setChallengesStep] = useState(1);

    // Steps list configuration
    const steps = [
        {
            id: 'overview',
            title: t('requirements'),
            icon: FiCheck,
            isCompleted: !!completedModules['overview'],
        },
        {
            id: 'challenges',
            title: t('weekly_challenge'),
            icon: FiCalendar,
            isCompleted: !!completedModules['challenges'],
        },
        {
            id: 'voting',
            title: t('voting'),
            icon: FiShare2,
            isCompleted: !!completedModules['voting'],
        },
        {
            id: 'test',
            title: t('final_test'),
            icon: FiHelpCircle,
            isCompleted: isTestPassed,
        },
    ];

    if (!isMounted) {
        return null;
    }

    return (
        <Container>
            <div className="px-4 py-8">
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => router.push('/courses')}
                    className="mb-6 flex items-center gap-2 text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <FiChevronLeft className="cursor-pointer text-xl" />
                    <span>{t('back') || 'Back'}</span>
                </button>

                <SectionHeader
                    icon={FiBookOpen}
                    title={t('community_events_course')}
                    description={t(
                        'community_events_course_details.course_description'
                    )}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Stepper Side Navigation */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <h4 className="mb-4 px-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                {t('course_steps')}
                            </h4>
                            <CourseStepper
                                modules={steps}
                                activeModuleId={activeStep}
                                onSelectModule={(id) =>
                                    setActiveStep(id as StepId)
                                }
                            />
                        </div>
                    </div>

                    {/* Main content display panel */}
                    <div className="space-y-6 md:col-span-8 lg:col-span-9">
                        {/* 1. Overview Checklist panel */}
                        {activeStep === 'overview' && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-6 flex items-center gap-3">
                                    <FiCheck className="size-8 text-neutral-700 dark:text-neutral-300" />
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {t(
                                            'community_events_course_details.overview_title'
                                        )}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'community_events_course_details.evt_challenge_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'community_events_course_details.evt_challenge_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'community_events_course_details.evt_contest_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'community_events_course_details.evt_contest_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'community_events_course_details.evt_temp_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'community_events_course_details.evt_temp_desc'
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                {t(
                                                    'community_events_course_details.evt_voting_label'
                                                )}
                                            </h4>
                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                {t(
                                                    'community_events_course_details.evt_voting_desc'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-neutral-50 p-6 dark:bg-neutral-800/30">
                                        <h4 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                            {t(
                                                'community_events_course_details.action_required'
                                            )}
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.challenge
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'challenge'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'community_events_course_details.checklist_challenge'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.contest
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'contest'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'community_events_course_details.checklist_contest'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.calendar
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'calendar'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'community_events_course_details.checklist_temp'
                                                    )}
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        overviewChecked.voting
                                                    }
                                                    onChange={() =>
                                                        handleOverviewCheck(
                                                            'voting'
                                                        )
                                                    }
                                                    className="mt-1 accent-green-600"
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {t(
                                                        'community_events_course_details.checklist_voting'
                                                    )}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                        <div className="w-fit">
                                            <Button
                                                label={t(
                                                    'contest_manager_course_details.next_step'
                                                )}
                                                onClick={() =>
                                                    setActiveStep('challenges')
                                                }
                                                disabled={
                                                    !completedModules[
                                                        'overview'
                                                    ]
                                                }
                                                small
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Challenges walkthrough panel */}
                        {activeStep === 'challenges' && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-6 flex items-center gap-3">
                                    <FiCalendar className="size-8 text-neutral-700 dark:text-neutral-300" />
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {t(
                                            'community_events_course_details.challenges_title'
                                        )}
                                    </h2>
                                </div>

                                <div className="mb-8 space-y-6">
                                    {[1, 2, 3].map((step) => {
                                        const isActive = challengesStep >= step;
                                        return (
                                            <div
                                                key={step}
                                                className="flex gap-4"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                                                            isActive
                                                                ? 'bg-green-450 border-green-450 text-neutral-950'
                                                                : 'border-neutral-300 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'
                                                        }`}
                                                    >
                                                        {step}
                                                    </div>
                                                    {step < 3 && (
                                                        <div
                                                            className={`w-0.5 grow transition-all duration-300 ${
                                                                challengesStep >
                                                                step
                                                                    ? 'bg-green-450'
                                                                    : 'bg-neutral-200 dark:bg-neutral-800'
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                                <div
                                                    className={`pb-6 transition-all duration-300 ${
                                                        isActive
                                                            ? 'opacity-100'
                                                            : 'opacity-40'
                                                    }`}
                                                >
                                                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                                                        {t(
                                                            `community_events_course_details.challenges_step${step}_title`
                                                        )}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                                        {t(
                                                            `community_events_course_details.challenges_step${step}_desc`
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                    <span className="text-xs font-semibold text-neutral-500 uppercase">
                                        {t(
                                            'contest_manager_course_details.interactive_walkthrough'
                                        )}{' '}
                                        ({challengesStep}/3)
                                    </span>
                                    <div className="flex gap-2">
                                        {challengesStep < 3 ? (
                                            <div className="w-fit">
                                                <Button
                                                    label={t(
                                                        'contest_manager_course_details.next_step'
                                                    )}
                                                    onClick={() =>
                                                        setChallengesStep(
                                                            (prev) => prev + 1
                                                        )
                                                    }
                                                    small
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-fit">
                                                <Button
                                                    label={t(
                                                        'contest_manager_course_details.mark_completed'
                                                    )}
                                                    onClick={() => {
                                                        markModuleCompleted(
                                                            'challenges'
                                                        );
                                                        setActiveStep('voting');
                                                    }}
                                                    small
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Voting panel */}
                        {activeStep === 'voting' && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-6 flex items-center gap-3">
                                    <FiShare2 className="size-8 text-neutral-700 dark:text-neutral-300" />
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {t(
                                            'community_events_course_details.voting_title'
                                        )}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="border-neutral-150 rounded-xl border bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                            {t(
                                                'community_events_course_details.voting_desc1'
                                            )}
                                        </p>
                                        <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                            {t(
                                                'community_events_course_details.voting_desc2'
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                        <div className="w-fit">
                                            <Button
                                                label={t(
                                                    'contest_manager_course_details.mark_completed'
                                                )}
                                                onClick={() => {
                                                    markModuleCompleted(
                                                        'voting'
                                                    );
                                                    setActiveStep('test');
                                                }}
                                                small
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Quiz panel */}
                        {activeStep === 'test' && (
                            <div className="space-y-6">
                                {!isTestPassed ? (
                                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                                        <CourseTest
                                            questions={communityEventsQuestions}
                                            description={t(
                                                'community_events_course_details.final_test_description'
                                            )}
                                            onPass={() =>
                                                markModuleCompleted('test')
                                            }
                                        />
                                    </div>
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
                                            courseTitle="Community Events Certificate"
                                            currentUserNames={currentUser?.name}
                                            badgePath="/badges/community_events_badge.jpg"
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

export default CommunityEventsClient;
