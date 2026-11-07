'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiX, FiList } from 'react-icons/fi';
import useRecipeChecklist from '@/app/hooks/useRecipeChecklist';
import { formatText } from '@/app/utils/textFormatting';

interface CookingGuideIngredientsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    ingredients: string[];
    recipeId?: string;
}

export const CookingGuideIngredientsDrawer: React.FC<
    CookingGuideIngredientsDrawerProps
> = ({ isOpen, onClose, ingredients, recipeId }) => {
    const { t } = useTranslation();
    const { isCompleted, toggleIndex, completedCount } = useRecipeChecklist(
        recipeId,
        'ingredients'
    );

    if (!isOpen || ingredients.length === 0) return null;

    const seen = new Map<string, number>();

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50 backdrop-blur-xs"
            onClick={onClose}
            data-testid="cooking-guide-ingredients-drawer"
        >
            <div
                className="flex h-full w-full max-w-sm flex-col border-l border-neutral-200/80 bg-white p-5 shadow-2xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <FiList
                                size={18}
                                className="text-neutral-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                {String(
                                    t('ingredients', {
                                        defaultValue: 'Ingredients',
                                    })
                                )}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {completedCount}/{ingredients.length}{' '}
                                {String(
                                    t('guide_checked', {
                                        defaultValue: 'checked',
                                    })
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-50 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        aria-label={String(
                            t('close', { defaultValue: 'Close' })
                        )}
                        data-testid="close-ingredients-drawer-btn"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <ul className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
                    {ingredients.map((item, idx) => {
                        const count = (seen.get(item) ?? 0) + 1;
                        seen.set(item, count);
                        const itemKey = count === 1 ? item : `${item}-${count}`;
                        const completed = isCompleted(idx);
                        return (
                            <li key={itemKey}>
                                <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={completed}
                                    onClick={() => toggleIndex(idx)}
                                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                                >
                                    <span
                                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                                            completed
                                                ? 'border-green-450 bg-green-450 text-neutral-950'
                                                : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
                                        }`}
                                    >
                                        {completed && (
                                            <FiCheck
                                                size={12}
                                                className="stroke-[3]"
                                            />
                                        )}
                                    </span>
                                    <span
                                        className={`flex-1 text-sm leading-relaxed ${
                                            completed
                                                ? 'text-neutral-400 line-through dark:text-neutral-500'
                                                : 'text-neutral-700 dark:text-neutral-200'
                                        }`}
                                    >
                                        {formatText(item)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default CookingGuideIngredientsDrawer;
