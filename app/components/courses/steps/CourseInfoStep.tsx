'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconType } from 'react-icons';
import Button from '@/app/components/buttons/Button';

interface CourseInfoStepProps {
    title: string;
    icon: IconType;
    paragraphs?: string[];
    onComplete: () => void;
    buttonLabel?: string;
    children?: React.ReactNode;
}

const CourseInfoStep: React.FC<CourseInfoStepProps> = ({
    title,
    icon: Icon,
    paragraphs,
    onComplete,
    buttonLabel,
    children,
}) => {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-6 flex items-center gap-3">
                <Icon className="size-8 text-neutral-700 dark:text-neutral-300" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <div className="space-y-6">
                {paragraphs && paragraphs.length > 0 && (
                    <div className="border-neutral-150 rounded-xl border bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                        {paragraphs.map((p, idx) => (
                            <p
                                key={p}
                                className={`text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 ${
                                    idx > 0 ? 'mt-4' : ''
                                }`}
                            >
                                {p}
                            </p>
                        ))}
                    </div>
                )}

                {children}

                <div className="flex justify-end border-t border-neutral-100 pt-6 dark:border-neutral-800">
                    <div className="w-fit">
                        <Button
                            label={
                                buttonLabel ||
                                t(
                                    'contest_manager_course_details.mark_completed'
                                )
                            }
                            onClick={onComplete}
                            small
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseInfoStep;
