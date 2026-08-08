'use client';

import React from 'react';

interface RecipeGanttPreStepsProps {
    preSteps: string[];
}

export const RecipeGanttPreSteps: React.FC<RecipeGanttPreStepsProps> = ({
    preSteps,
}) => {
    if (!Array.isArray(preSteps) || preSteps.length === 0) {
        return null;
    }

    return (
        <div className="mb-5 flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            {preSteps.map((step, idx) => (
                <div
                    key={`pre-${step}-${idx}`}
                    className="flex items-start gap-2"
                >
                    <span className="font-semibold text-rose-500">•</span>
                    <span>{step}</span>
                </div>
            ))}
        </div>
    );
};

export default RecipeGanttPreSteps;
