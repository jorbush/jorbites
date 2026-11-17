'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeCertificate, SafeUser } from '@/app/types';
import CourseTest from '@/app/components/courses/core/CourseTest';
import CourseCompleted from '@/app/components/courses/steps/CourseCompleted';
import { recipeCreatorQuestions } from './recipeCreatorQuestions';

interface RecipeCreatorTestStepProps {
    isTestPassed: boolean;
    currentUser?: SafeUser | null;
    initialCertificate?: SafeCertificate | null;
    onPass: () => void;
}

const RecipeCreatorTestStep: React.FC<RecipeCreatorTestStepProps> = ({
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
                        questions={recipeCreatorQuestions}
                        description={
                            (t(
                                'recipe_creator_course_details.final_test_description'
                            ) as string) ||
                            'Test your knowledge with 5 multiple-choice questions. You need at least 80% (4 correct answers) to pass and receive the Recipe Creator Certificate.'
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
                courseTitle="Recipe Creator Certificate"
                currentUserNames={currentUser?.name}
                badgePath="/badges/recipe_lists_badge_1783155223621.jpg"
                courseId="recipe-creator"
                initialCertificate={initialCertificate}
            />
        </div>
    );
};

export default RecipeCreatorTestStep;
