'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { draftsQuestions } from '@/app/courses/drafts/draftsQuestions';

interface DraftsTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    onPass: () => void;
}

export const DraftsTestStep: React.FC<DraftsTestStepProps> = ({
    isTestPassed,
    currentUser,
    onPass,
}) => {
    const { t } = useTranslation();

    if (!isTestPassed) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                    <CourseTest
                        questions={draftsQuestions}
                        description={
                            (t(
                                'drafts_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 10 questions on drafts, co-cooking, roles, and live collaboration. You need at least 80% (8 correct answers) to pass and earn your Recipe Drafts Certificate!'
                        }
                        onPass={onPass}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CourseCompleted
                courseTitle={
                    (t('drafts_course_details.certificate_title') as string) ||
                    'Recipe Drafts & Collaboration Certificate'
                }
                currentUserNames={currentUser?.name}
                badgePath="/badges/drafts_badge.webp"
            />
        </div>
    );
};

export default DraftsTestStep;
