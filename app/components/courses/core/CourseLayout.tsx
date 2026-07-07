'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import { IconType } from 'react-icons';
import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
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
    headerIcon,
    steps,
    activeStep,
    onSelectStep,
    children,
}) => {
    const { t } = useTranslation();
    const { push } = useRouter();

    return (
        <Container>
            <div className="px-4 py-8">
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => push('/courses')}
                    className="mb-6 flex items-center gap-2 text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <FiChevronLeft className="cursor-pointer text-xl" />
                    <span>{t('back') || 'Back'}</span>
                </button>

                <SectionHeader
                    icon={headerIcon}
                    title={courseTitle}
                    description={courseDescription}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Stepper Side Navigation */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
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
