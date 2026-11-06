'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';
import useRecipeChecklist from '@/app/hooks/useRecipeChecklist';
import { formatText } from '@/app/utils/textFormatting';
import RecipeChecklistHeader from './RecipeChecklistHeader';

export interface RecipeStepsProps {
    items: string[];
    recipeId?: string;
}

export const RecipeSteps: React.FC<RecipeStepsProps> = ({
    items,
    recipeId,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const { isCompleted, toggleIndex, resetChecklist, completedCount } =
        useRecipeChecklist(recipeId, 'steps');

    if (items.length === 0) return null;

    const seen = new Map<string, number>();

    return (
        <div
            className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100"
            data-cy="steps-section"
        >
            <RecipeChecklistHeader
                title={mounted ? t('steps') : 'steps'}
                completedCount={completedCount}
                totalCount={items.length}
                onReset={resetChecklist}
            />

            <ol className="mt-4 space-y-2">
                {items.map((item, index) => {
                    const count = (seen.get(item) ?? 0) + 1;
                    seen.set(item, count);
                    const key = count === 1 ? item : `${item}-${count}`;
                    const completed = isCompleted(index);

                    return (
                        <li
                            key={key}
                            data-cy={`step-${index}`}
                        >
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={completed}
                                onClick={() => toggleIndex(index)}
                                onKeyDown={(e) => {
                                    if (e.key === ' ' || e.key === 'Enter') {
                                        e.preventDefault();
                                        toggleIndex(index);
                                    }
                                }}
                                className="overflow-wrap-anywhere -mx-2 flex w-full cursor-pointer items-start gap-3.5 rounded-xl p-2 text-left break-words transition-colors duration-200 select-none hover:bg-neutral-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-800/50"
                            >
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors duration-200 ${
                                        completed
                                            ? 'border-green-450 bg-green-450 text-neutral-950 shadow-2xs'
                                            : 'border-green-450/40 bg-green-450/15 dark:text-green-450 text-neutral-900'
                                    }`}
                                >
                                    {completed ? (
                                        <FiCheck
                                            size={14}
                                            className="stroke-[3]"
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <div
                                    className={`flex-1 pt-0.5 leading-relaxed transition-colors duration-200 ${
                                        completed
                                            ? 'text-neutral-400 line-through dark:text-neutral-500'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                    }`}
                                >
                                    {formatText(item)}
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default RecipeSteps;
