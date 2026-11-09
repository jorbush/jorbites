'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { mealPlannerQuestions } from '../mealPlannerQuestions';
import { SafeCertificate, SafeUser } from '@/app/types';

interface MealPlannerTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
    onPass: () => void;
}

export const MealPlannerTestStep: React.FC<MealPlannerTestStepProps> = ({
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
                        questions={mealPlannerQuestions}
                        description={
                            (t(
                                'meal_planner_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Meal Planner Certificate.'
                        }
                        onPass={onPass}
                    />
                </div>
            ) : (
                <CourseCompleted
                    courseTitle="Meal Planner Certificate"
                    currentUserNames={currentUser?.name}
                    badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                    courseId="meal-planner"
                    initialCertificate={initialCertificate}
                />
            )}
        </div>
    );
};

export default MealPlannerTestStep;
