'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { jorbitesBasicsQuestions } from '../jorbitesBasicsQuestions';
import { SafeCertificate, SafeUser } from '@/app/types';

interface JorbitesBasicsTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
    onPass: () => void;
}

export const JorbitesBasicsTestStep: React.FC<JorbitesBasicsTestStepProps> = ({
    isTestPassed,
    currentUser,
    initialCertificate,
    onPass,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {!isTestPassed ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                    <CourseTest
                        questions={jorbitesBasicsQuestions}
                        description={
                            (t(
                                'jorbites_basics_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 6 multiple-choice questions. You need at least 80% (5 correct answers) to pass and receive the Jorbites Basics Certificate.'
                        }
                        onPass={onPass}
                    />
                </div>
            ) : (
                <CourseCompleted
                    courseTitle="Jorbites Basics Certificate"
                    currentUserNames={currentUser?.name}
                    badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                    courseId="jorbites-basics"
                    initialCertificate={initialCertificate}
                />
            )}
        </div>
    );
};

export default JorbitesBasicsTestStep;
