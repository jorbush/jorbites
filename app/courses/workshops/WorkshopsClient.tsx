'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiAward,
    FiBookOpen,
    FiUserPlus,
    FiLock,
} from 'react-icons/fi';
import { FcConferenceCall } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import { workshopsQuestions } from './workshopsQuestions';
import useIsMounted from '@/app/hooks/useIsMounted';

import WorkshopsOverview from './WorkshopsOverview';

interface WorkshopsClientProps {
    currentUser?: SafeUser | null;
}

type StepId = 'requirements' | 'workflow' | 'whitelist' | 'approvals' | 'test';

const MODULES_KEY = 'jorbites_course_workshops_modules:v2';
const PROGRESS_KEY = 'jorbites_course_workshops_progress:v2';

const WorkshopsClient: React.FC<WorkshopsClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => ['requirements', 'workflow', 'whitelist', 'approvals', 'test'],
        []
    );

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(MODULES_KEY, PROGRESS_KEY, allStepIds);

    const steps = [
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
    ];

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('course_workshops') || 'Workshops & Classes'}
            courseDescription={
                t('workshops_course_details.course_description') ||
                'Discover how to host workshops, manage student whitelists, request approvals, and join live cooking classes.'
            }
            headerIcon={FcConferenceCall}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements Checklist */}
            {activeStep === 'requirements' && (
                <WorkshopsOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Walkthrough Steps */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('workshops_course_details.workflow_title') ||
                        'Creation Walkthrough'
                    }
                    icon={FiBookOpen}
                    stepPrefix="workshops_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('whitelist');
                    }}
                />
            )}

            {/* 3. Whitelisting / Student Invites */}
            {activeStep === 'whitelist' && (
                <CourseInfoStep
                    title={
                        t('workshops_course_details.whitelist_info_title') ||
                        'Inviting Whitelisted Students'
                    }
                    icon={FiUserPlus}
                    paragraphs={[
                        t('workshops_course_details.whitelist_desc1') ||
                            'For private workshops, you can restrict access by selecting specific Jorbites users to join your session.',
                        t('workshops_course_details.whitelist_desc2') ||
                            'Users who are whitelisted will be able to see the workshop on their dashboard and register. Public workshops are visible to the entire community.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('whitelist');
                        setActiveStep('approvals');
                    }}
                />
            )}

            {/* 4. Approvals and Seat Capacity */}
            {activeStep === 'approvals' && (
                <CourseInfoStep
                    title={
                        t('workshops_course_details.approval_info_title') ||
                        'Approvals & Capacity Management'
                    }
                    icon={FiLock}
                    paragraphs={[
                        t('workshops_course_details.approval_desc1') ||
                            'All newly created workshops require administrator review to ensure quality. Once approved, the workshop is published and users can register.',
                        t('workshops_course_details.approval_desc2') ||
                            'The host can view the participant roster and accept or decline join requests manually. If a workshop reaches maximum capacity, it is automatically marked as full.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('approvals');
                        setActiveStep('test');
                    }}
                />
            )}

            {/* 5. Final Test */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={workshopsQuestions}
                                description={
                                    (t(
                                        'workshops_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Workshops Certificate.'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle="Workshops & Classes Certificate"
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/community_events_badge.jpg"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default WorkshopsClient;
