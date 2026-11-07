'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import { IconType } from 'react-icons';
import Container from '@/app/components/utils/Container';
import CourseStepper from './CourseStepper';

interface CourseStep {
    id: string;
    title: string;
    icon: IconType;
    isCompleted: boolean;
}

interface CourseLayoutProps {
    courseTitle: string;
    courseDescription: string;
    headerIcon: IconType;
    steps: CourseStep[];
    activeStep: string;
    onSelectStep: (id: string) => void;
    children: React.ReactNode;
}

const CourseLayout: React.FC<CourseLayoutProps> = ({
    courseTitle,
    courseDescription,
    headerIcon: HeaderIcon,
    steps,
    activeStep,
    onSelectStep,
    children,
}) => {
    const { t } = useTranslation();
    const { push } = useRouter();

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => push('/courses')}
                        className="group inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        aria-label={t('back') || 'Back'}
                    >
                        <div className="flex size-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-neutral-100 shadow-2xs transition-colors duration-200 group-hover:bg-neutral-200 dark:border-neutral-700/60 dark:bg-neutral-800 dark:group-hover:bg-neutral-700">
                            <FiChevronLeft className="size-4" />
                        </div>
                        <span>{t('back') || 'Back'}</span>
                    </button>

                    <div className="flex items-center gap-3.5">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <HeaderIcon size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                {courseTitle}
                            </h1>
                            {courseDescription && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {courseDescription}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Stepper Side Navigation */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-xs dark:border-neutral-800/80 dark:bg-neutral-900/60">
                            <h4 className="mb-4 px-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                {t('course_steps')}
                            </h4>
                            <CourseStepper
                                modules={steps}
                                activeModuleId={activeStep}
                                onSelectModule={onSelectStep}
                            />
                        </div>
                    </div>

                    {/* Main content display panel */}
                    <div className="space-y-6 md:col-span-8 lg:col-span-9">
                        {children}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CourseLayout;
