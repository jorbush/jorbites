'use client';

import React from 'react';
import { IconType } from 'react-icons';
import { FiCheck } from 'react-icons/fi';

interface StepperModule {
    id: string;
    title: string;
    isCompleted: boolean;
    icon: IconType;
}

interface CourseStepperProps {
    modules: StepperModule[];
    activeModuleId: string;
    onSelectModule: (id: string) => void;
}

const CourseStepper: React.FC<CourseStepperProps> = ({
    modules,
    activeModuleId,
    onSelectModule,
}) => {
    return (
        <div className="w-full">
            {/* Desktop View: Vertical sticky list */}
            <div className="hidden space-y-2 md:block">
                {modules.map((mod, index) => {
                    const isActive = mod.id === activeModuleId;

                    return (
                        <button
                            key={mod.id}
                            type="button"
                            onClick={() => onSelectModule(mod.id)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 focus:outline-hidden ${
                                isActive
                                    ? 'bg-green-450/20 dark:bg-green-450/10 text-neutral-900 dark:text-green-300'
                                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40'
                            }`}
                        >
                            <div className="relative flex items-center justify-center">
                                {mod.isCompleted ? (
                                    <div className="bg-green-450 flex size-6 items-center justify-center rounded-full text-green-950">
                                        <FiCheck className="size-3.5" />
                                    </div>
                                ) : (
                                    <div
                                        className={`flex size-6 items-center justify-center rounded-full border-2 ${
                                            isActive
                                                ? 'border-green-450 text-neutral-900 dark:text-green-300'
                                                : 'border-neutral-300 dark:border-neutral-700'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold">
                                            {index + 1}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <span
                                className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}
                            >
                                {mod.title}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile View: Horizontal scrolling steps */}
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-4 md:hidden">
                {modules.map((mod, index) => {
                    const isActive = mod.id === activeModuleId;
                    return (
                        <button
                            key={mod.id}
                            type="button"
                            onClick={() => onSelectModule(mod.id)}
                            className={`flex min-w-[120px] flex-shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl p-3 text-center transition focus:outline-hidden ${
                                isActive
                                    ? 'bg-green-450/20 dark:bg-green-450/10 text-neutral-900 dark:text-green-300'
                                    : 'bg-neutral-50/50 text-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400'
                            }`}
                        >
                            <div className="flex items-center justify-center">
                                {mod.isCompleted ? (
                                    <div className="bg-green-450 flex size-5 items-center justify-center rounded-full text-green-950">
                                        <FiCheck className="size-3" />
                                    </div>
                                ) : (
                                    <div
                                        className={`flex size-5 items-center justify-center rounded-full border-2 text-[10px] font-semibold ${
                                            isActive
                                                ? 'border-green-450 text-neutral-900 dark:text-green-300'
                                                : 'border-neutral-300 dark:border-neutral-700'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                )}
                            </div>
                            <span className="max-w-[100px] truncate text-xs font-medium">
                                {mod.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseStepper;
