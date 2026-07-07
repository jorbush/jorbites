'use client';

import React from 'react';
import { IconType } from 'react-icons';
import { FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';

interface CourseModuleProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    isCompleted: boolean;
    icon: IconType;
    children: React.ReactNode;
}

const CourseModule: React.FC<CourseModuleProps> = ({
    title,
    isOpen,
    onToggle,
    isCompleted,
    icon: Icon,
    children,
}) => {
    return (
        <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200 bg-white transition duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition focus:outline-hidden"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <Icon className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 sm:text-lg dark:text-white">
                            {title}
                        </h3>
                        {isCompleted && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <FiCheckCircle className="size-3.5" />
                                Completed
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">
                    {isOpen ? (
                        <FiChevronUp className="size-5" />
                    ) : (
                        <FiChevronDown className="size-5" />
                    )}
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-neutral-100 p-6 text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseModule;
