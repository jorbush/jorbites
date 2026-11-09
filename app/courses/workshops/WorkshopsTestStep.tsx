'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeCertificate, SafeUser } from '@/app/types';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { workshopsQuestions } from './workshopsQuestions';

interface WorkshopsTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
    onPass: () => void;
}

export const WorkshopsTestStep: React.FC<WorkshopsTestStepProps> = ({
    isTestPassed,
    currentUser,
    initialCertificate,
    onPass,
}) => {
    const { t } = useTranslation();

    if (!isTestPassed) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                    <CourseTest
                        questions={workshopsQuestions}
                        description={
                            (t(
                                'workshops_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Workshops Certificate.'
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
                courseTitle="Workshops & Classes Certificate"
                currentUserNames={currentUser?.name}
                badgePath="/badges/community_events_badge.jpg"
                courseId="workshops"
                initialCertificate={initialCertificate}
            />
        </div>
    );
};

export default WorkshopsTestStep;
