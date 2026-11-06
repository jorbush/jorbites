'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiRotateCcw } from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';
import useRecipeChecklist from '@/app/hooks/useRecipeChecklist';
import { formatText } from '@/app/utils/textFormatting';

export interface RecipeIngredientsProps {
    items: string[];
    recipeId?: string;
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
    items,
    recipeId,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const { isCompleted, toggleIndex, resetChecklist, completedCount } =
        useRecipeChecklist(recipeId, 'ingredients');

    if (items.length === 0) return null;

    const seen = new Map<string, number>();

    return (
        <div
            className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100"
            data-cy="ingredients-section"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        {mounted ? t('ingredients') : 'ingredients'}
                    </h3>
                    {completedCount > 0 && (
                        <span className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-900">
                            {completedCount}/{items.length}
                        </span>
                    )}
                </div>

                {completedCount > 0 && (
                    <button
                        type="button"
                        onClick={resetChecklist}
                        className="flex cursor-pointer items-center gap-1 text-xs font-medium text-neutral-400 transition-colors duration-200 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                        title={
                            mounted ? t('reset_checklist') || 'Reset' : 'Reset'
                        }
                        aria-label={
                            mounted ? t('reset_checklist') || 'Reset' : 'Reset'
                        }
                    >
                        <FiRotateCcw size={12} />
                        <span>
                            {mounted
                                ? t('reset_checklist') || 'Reset'
                                : 'Reset'}
                        </span>
                    </button>
                )}
            </div>

            <ul className="mt-4 space-y-1 text-neutral-700 dark:text-neutral-300">
                {items.map((item, index) => {
                    const count = (seen.get(item) ?? 0) + 1;
                    seen.set(item, count);
                    const key = count === 1 ? item : `${item}-${count}`;
                    const completed = isCompleted(index);

                    return (
                        <li
                            key={key}
                            role="checkbox"
                            aria-checked={completed}
                            tabIndex={0}
                            onClick={() => toggleIndex(index)}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    toggleIndex(index);
                                }
                            }}
                            className="-mx-2 flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors duration-200 select-none hover:bg-neutral-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-800/50"
                        >
                            <span
                                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 ${
                                    completed
                                        ? 'border-green-450 bg-green-450 text-neutral-950 shadow-2xs'
                                        : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
                                }`}
                            >
                                {completed && (
                                    <FiCheck
                                        size={13}
                                        className="stroke-[3]"
                                    />
                                )}
                            </span>
                            <span
                                className={`flex-1 text-base leading-relaxed transition-colors duration-200 ${
                                    completed
                                        ? 'text-neutral-400 line-through dark:text-neutral-500'
                                        : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                            >
                                {formatText(item)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RecipeIngredients;
