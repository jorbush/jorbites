'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import Counter from '@/app/components/inputs/Counter';
import useIsMounted from '@/app/hooks/useIsMounted';
import useRecipeChecklist from '@/app/hooks/useRecipeChecklist';
import { detectAllergens } from '@/app/utils/allergenDetector';
import { scaleIngredient } from '@/app/utils/ingredientScaler';
import { formatText } from '@/app/utils/textFormatting';
import RecipeChecklistHeader from './RecipeChecklistHeader';

export interface RecipeIngredientsProps {
    items: string[];
    rawIngredients?: string[];
    categories?: string[];
    recipeId?: string;
    recipeYield?: number | null;
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({
    items,
    rawIngredients,
    categories,
    recipeId,
    recipeYield,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const { isCompleted, toggleIndex, resetChecklist, completedCount } =
        useRecipeChecklist(recipeId, 'ingredients');
    const [customServings, setCustomServings] = useState<{
        baseYield: number;
        value: number;
    } | null>(null);

    const hasValidYield = typeof recipeYield === 'number' && recipeYield > 0;
    const currentServings =
        hasValidYield &&
        customServings !== null &&
        customServings.baseYield === recipeYield
            ? customServings.value
            : hasValidYield
              ? recipeYield
              : 1;

    const handleServingsChange = useCallback(
        (nextValue: number) => {
            if (!hasValidYield) return;
            setCustomServings({
                baseYield: recipeYield,
                value: Math.max(1, nextValue),
            });
        },
        [hasValidYield, recipeYield]
    );

    const detectedAllergens = useMemo(() => {
        const sourceItems =
            rawIngredients && rawIngredients.length > 0
                ? rawIngredients
                : items;
        return detectAllergens(sourceItems, categories);
    }, [rawIngredients, items, categories]);

    if (items.length === 0) return null;

    const seen = new Map<string, number>();

    return (
        <div
            className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100"
            data-cy="ingredients-section"
        >
            <RecipeChecklistHeader
                title={mounted ? t('ingredients') : 'ingredients'}
                completedCount={completedCount}
                totalCount={items.length}
                onReset={resetChecklist}
                actionSlot={
                    hasValidYield ? (
                        <Counter
                            title={mounted ? t('servings') : 'servings'}
                            value={currentServings}
                            onChange={handleServingsChange}
                            minValue={1}
                            compact
                        />
                    ) : undefined
                }
            />

            <ul className="mt-4 space-y-1 text-neutral-700 dark:text-neutral-300">
                {items.map((item, index) => {
                    const count = (seen.get(item) ?? 0) + 1;
                    seen.set(item, count);
                    const key = count === 1 ? item : `${item}-${count}`;
                    const completed = isCompleted(index);
                    const displayItem = hasValidYield
                        ? scaleIngredient(item, recipeYield, currentServings)
                        : item;

                    return (
                        <li key={key}>
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
                                className="-mx-2 flex w-full cursor-pointer items-start gap-3 rounded-xl p-2 text-left transition-colors duration-200 select-none hover:bg-neutral-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:bg-neutral-800/50"
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
                                    {formatText(displayItem)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {detectedAllergens.length > 0 && (
                <div
                    className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800/80"
                    data-cy="recipe-allergens"
                    data-testid="recipe-allergens"
                >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                            <FiAlertCircle
                                size={14}
                                className="shrink-0 text-amber-600 dark:text-amber-400"
                            />
                            <span>
                                {mounted ? t('allergens') : 'allergens'}
                            </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            {mounted ? t('allergens_disclaimer') : ''}
                        </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {detectedAllergens.map((allergen) => {
                            const Icon = allergen.icon;
                            const labelKey = `allergen_${allergen.id}`;
                            const label = String(
                                mounted ? t(labelKey) : labelKey
                            );
                            const tooltip = String(
                                `${label}: ${allergen.matchedIngredients.join(', ')}`
                            );
                            return (
                                <span
                                    key={allergen.id}
                                    data-testid={`allergen-badge-${allergen.id}`}
                                    title={tooltip}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200"
                                >
                                    <Icon
                                        size={14}
                                        className="shrink-0 text-amber-700 dark:text-amber-300"
                                    />
                                    <span>{label}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeIngredients;
