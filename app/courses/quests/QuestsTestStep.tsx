'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeCertificate, SafeUser } from '@/app/types';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { questsQuestions } from './questsQuestions';

interface QuestsTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
    onPass: () => void;
}

const QuestsTestStep: React.FC<QuestsTestStepProps> = ({
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
                        questions={questsQuestions}
                        description={
                            (t(
                                'quests_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Quests Certificate.'
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
                courseTitle="Recipe Quests Certificate"
                currentUserNames={currentUser?.name}
                badgePath="/badges/community_events_badge.jpg"
                courseId="quests"
                initialCertificate={initialCertificate}
            />
        </div>
    );
};

export default QuestsTestStep;
