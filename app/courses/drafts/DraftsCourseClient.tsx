'use client';

import React, { useState, useMemo } from 'react';
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
import { FcDocument } from 'react-icons/fc';
import { SafeUser } from '@/app/types';

import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseLayout from '@/app/components/courses/core/CourseLayout';
import CourseInfoStep from '@/app/components/courses/steps/CourseInfoStep';
import CourseWorkflowStep from '@/app/components/courses/steps/CourseWorkflowStep';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { useCourseProgress } from '@/app/hooks/useCourseProgress';
import useIsMounted from '@/app/hooks/useIsMounted';

import DraftsCourseOverview from './DraftsCourseOverview';
import DraftQuotaSimulator from './simulators/DraftQuotaSimulator';
import RolePermissionSimulator from './simulators/RolePermissionSimulator';
import LockSimulator from './simulators/LockSimulator';
import { draftsQuestions } from './draftsQuestions';

interface DraftsCourseClientProps {
    currentUser?: SafeUser | null;
}

type StepId =
    | 'requirements'
    | 'workflow'
    | 'invites'
    | 'roles'
    | 'locking'
    | 'sync'
    | 'test';

const MODULES_KEY = 'jorbites_course_drafts_modules:v2';
const PROGRESS_KEY = 'jorbites_course_drafts_progress:v2';

const DraftsCourseClient: React.FC<DraftsCourseClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();

    const [activeStep, setActiveStep] = useState<StepId>('requirements');

    const allStepIds = useMemo(
        () => [
            'requirements',
            'workflow',
            'invites',
            'roles',
            'locking',
            'sync',
            'test',
        ],
        []
    );

    const { completedModules, markModuleCompleted, isTestPassed } =
        useCourseProgress(MODULES_KEY, PROGRESS_KEY, allStepIds);

    const steps = [
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
            title: t('drafts_course_details.step_invites') || 'Invites & Team',
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
            title: t('drafts_course_details.step_locking') || 'Step Locking',
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
    ];

    if (!isMounted) {
        return null;
    }

    return (
        <CourseLayout
            courseTitle={t('course_drafts') || 'Recipe Drafts & Collaboration'}
            courseDescription={
                t('course_drafts_desc') ||
                'Learn how to manage multiple recipe drafts, invite friends to cook together, assign roles, and collaborate seamlessly without overwriting work.'
            }
            headerIcon={FcDocument}
            steps={steps}
            activeStep={activeStep}
            onSelectStep={(id) => setActiveStep(id as StepId)}
        >
            {/* 1. Requirements & Draft Basics */}
            {activeStep === 'requirements' && (
                <DraftsCourseOverview
                    completedModules={completedModules}
                    markModuleCompleted={markModuleCompleted}
                    onNext={() => setActiveStep('workflow')}
                />
            )}

            {/* 2. Workflow Timeline */}
            {activeStep === 'workflow' && (
                <CourseWorkflowStep
                    title={
                        t('drafts_course_details.workflow_title') ||
                        'Managing Multiple Drafts'
                    }
                    icon={FiBookOpen}
                    stepPrefix="drafts_course_details.workflow_step"
                    totalSteps={5}
                    onComplete={() => {
                        markModuleCompleted('workflow');
                        setActiveStep('invites');
                    }}
                />
            )}

            {/* 3. Inviting Friends & Co-Cooks */}
            {activeStep === 'invites' && (
                <CourseInfoStep
                    title={
                        t('drafts_course_details.invites_title') ||
                        'Inviting Friends & Co-Cooks'
                    }
                    icon={FiUserPlus}
                    paragraphs={[
                        t('drafts_course_details.invites_desc1') ||
                            'Cooking is more fun together! Jorbites makes it easy to invite family and friends to co-author your recipes.',
                        t('drafts_course_details.invites_desc2') ||
                            'You can share a private invite link directly via chat, or search for friends by their Jorbites username and add them instantly.',
                        t('drafts_course_details.invites_desc3') ||
                            'Best of all, inviting a co-cook to your solo draft automatically upgrades it into a shared collaborative draft—no manual setup needed.',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('invites');
                        setActiveStep('roles');
                    }}
                >
                    <DraftQuotaSimulator />
                </CourseInfoStep>
            )}

            {/* 4. Chef Roles: Editor vs Viewer */}
            {activeStep === 'roles' && (
                <CourseInfoStep
                    title={
                        t('drafts_course_details.roles_title') ||
                        'Chef Roles: Editor vs. Viewer'
                    }
                    icon={FiShield}
                    paragraphs={[
                        t('drafts_course_details.roles_desc1') ||
                            'Every kitchen needs good teamwork. As the recipe owner, you decide the level of access each co-cook receives.',
                        t('drafts_course_details.roles_desc2') ||
                            'Editors can add ingredients, write instructions, and update cooking times. Viewers have a read-only view—perfect for taste testers, family members, or proofreaders who want to review without accidentally modifying the text.',
                        t('drafts_course_details.roles_desc3') ||
                            "Collaborators can also cleanly click 'Leave draft' whenever their contribution is complete.",
                    ]}
                    onComplete={() => {
                        markModuleCompleted('roles');
                        setActiveStep('locking');
                    }}
                >
                    <RolePermissionSimulator />
                </CourseInfoStep>
            )}

            {/* 5. Live Co-Cooking & Step Locking */}
            {activeStep === 'locking' && (
                <CourseInfoStep
                    title={
                        t('drafts_course_details.locking_title') ||
                        'Live Co-Cooking & Step Locking'
                    }
                    icon={FiLock}
                    paragraphs={[
                        t('drafts_course_details.locking_desc1') ||
                            'Wondering what happens if two chefs edit the same recipe at the same time? Jorbites features smart Step Locking to keep everyone organized.',
                        t('drafts_course_details.locking_desc2') ||
                            "When your co-cook enters the 'Ingredients' step, that step displays an orange banner showing their avatar: 'Chef Maria is currently editing this step'.",
                        t('drafts_course_details.locking_desc3') ||
                            'While your friend is editing, that specific step is gently protected to prevent accidental typing collisions. As soon as your friend moves to the next step, it unlocks immediately for you!',
                    ]}
                    onComplete={() => {
                        markModuleCompleted('locking');
                        setActiveStep('sync');
                    }}
                >
                    <LockSimulator />
                </CourseInfoStep>
            )}

            {/* 6. Live Updates & Publishing Together */}
            {activeStep === 'sync' && (
                <CourseInfoStep
                    title={
                        t('drafts_course_details.sync_title') ||
                        'Live Updates & Publishing Together'
                    }
                    icon={FiRefreshCw}
                    paragraphs={[
                        t('drafts_course_details.sync_desc1') ||
                            'Jorbites automatically synchronizes recipe edits in the background. When your co-cook adds garlic or adjusts cooking minutes, their updates appear on your screen automatically without having to refresh.',
                        t('drafts_course_details.sync_desc2') ||
                            'Even better, Jorbites actively protects your in-progress typing—your words will never be erased by incoming updates from other chefs.',
                        t('drafts_course_details.sync_desc3') ||
                            "Whenever a co-cook makes changes, a friendly toast appears: 'Step updated by a co-cook 👨‍🍳'. Once your culinary creation is complete, hit 'Publish' and share your masterpiece with the world!",
                    ]}
                    onComplete={() => {
                        markModuleCompleted('sync');
                        setActiveStep('test');
                    }}
                />
            )}

            {/* 7. Final Exam & Certification */}
            {activeStep === 'test' && (
                <div className="space-y-6">
                    {!isTestPassed ? (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                            <CourseTest
                                questions={draftsQuestions}
                                description={
                                    (t(
                                        'drafts_course_details.final_test_description'
                                    ) as string) ||
                                    'Test your knowledge with 10 questions on drafts, co-cooking, roles, and live collaboration. You need at least 80% (8 correct answers) to pass and earn your Recipe Drafts Certificate!'
                                }
                                onPass={() => markModuleCompleted('test')}
                            />
                        </div>
                    ) : (
                        <CourseCompleted
                            courseTitle={
                                (t(
                                    'drafts_course_details.certificate_title'
                                ) as string) ||
                                'Recipe Drafts & Collaboration Certificate'
                            }
                            currentUserNames={currentUser?.name}
                            badgePath="/badges/drafts_badge.webp"
                        />
                    )}
                </div>
            )}
        </CourseLayout>
    );
};

export default DraftsCourseClient;
