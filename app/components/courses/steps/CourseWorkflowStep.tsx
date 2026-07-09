'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import Button from '@/app/components/buttons/Button';

interface CourseWorkflowStepProps {
    title: string;
    icon: IconType;
    stepPrefix: string;
    totalSteps: number;
    onComplete: () => void;
}

const CourseWorkflowStep: React.FC<CourseWorkflowStepProps> = ({
    title,
    icon: Icon,
    stepPrefix,
    totalSteps,
    onComplete,
}) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);

    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <Icon className="size-8 text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <div className="mb-8 space-y-6">
                {steps.map((step) => {
                    const isActive = currentStep >= step;
                    return (
                        <div
                            key={step}
                            className="flex gap-4"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                                        isActive
                                            ? 'bg-green-450 border-green-450 text-green-950'
                                            : 'border-neutral-300 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'
                                    }`}
                                >
                                    {step}
                                </div>
                                {step < totalSteps && (
                                    <div
                                        className={`w-0.5 grow transition-all duration-300 ${
                                            currentStep > step
                                                ? 'bg-green-450'
                                                : 'bg-neutral-200 dark:bg-neutral-800'
                                        }`}
                                    />
                                )}
                            </div>
                            <div
                                className={`pb-6 transition-all duration-300 ${
                                    isActive ? 'opacity-100' : 'opacity-40'
                                }`}
                            >
                                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                                    {t(`${stepPrefix}${step}_title`)}
                                </h4>
                                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    {t(`${stepPrefix}${step}_desc`)}
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
                    ({currentStep}/{totalSteps})
                </span>
                <div className="flex gap-2">
                    {currentStep < totalSteps ? (
                        <div className="w-fit">
                            <Button
                                label={t(
                                    'contest_manager_course_details.next_step'
                                )}
                                onClick={() =>
                                    setCurrentStep((prev) => prev + 1)
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
                                onClick={onComplete}
                                small
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseWorkflowStep;
