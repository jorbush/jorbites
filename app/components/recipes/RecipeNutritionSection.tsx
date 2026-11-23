'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiActivity, FiTag } from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface RecipeNutritionSectionProps {
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    saturatedFat?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    dietaryTags?: string[];
}

const EMPTY_TAGS: string[] = [];

interface NutrientItem {
    key: string;
    labelKey: string;
    fallbackLabel: string;
    value: number;
    unit: string;
}

export const RecipeNutritionSection: React.FC<RecipeNutritionSectionProps> = ({
    calories,
    protein,
    carbohydrates,
    fat,
    saturatedFat,
    fiber,
    sugar,
    sodium,
    dietaryTags = EMPTY_TAGS,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const nutrients = useMemo<NutrientItem[]>(() => {
        const items: NutrientItem[] = [];
        if (typeof protein === 'number') {
            items.push({
                key: 'protein',
                labelKey: 'protein',
                fallbackLabel: 'Protein',
                value: protein,
                unit: 'g',
            });
        }
        if (typeof carbohydrates === 'number') {
            items.push({
                key: 'carbohydrates',
                labelKey: 'carbohydrates',
                fallbackLabel: 'Carbs',
                value: carbohydrates,
                unit: 'g',
            });
        }
        if (typeof fat === 'number') {
            items.push({
                key: 'fat',
                labelKey: 'fat',
                fallbackLabel: 'Fat',
                value: fat,
                unit: 'g',
            });
        }
        if (typeof saturatedFat === 'number') {
            items.push({
                key: 'saturatedFat',
                labelKey: 'saturated_fat',
                fallbackLabel: 'Sat. fat',
                value: saturatedFat,
                unit: 'g',
            });
        }
        if (typeof fiber === 'number') {
            items.push({
                key: 'fiber',
                labelKey: 'fiber',
                fallbackLabel: 'Fiber',
                value: fiber,
                unit: 'g',
            });
        }
        if (typeof sugar === 'number') {
            items.push({
                key: 'sugar',
                labelKey: 'sugar',
                fallbackLabel: 'Sugar',
                value: sugar,
                unit: 'g',
            });
        }
        if (typeof sodium === 'number') {
            items.push({
                key: 'sodium',
                labelKey: 'sodium',
                fallbackLabel: 'Sodium',
                value: sodium,
                unit: 'mg',
            });
        }
        return items;
    }, [protein, carbohydrates, fat, saturatedFat, fiber, sugar, sodium]);

    const hasNutrients = nutrients.length > 0;
    const hasDietaryTags = dietaryTags.length > 0;

    if (!hasNutrients && !hasDietaryTags) {
        return null;
    }

    return (
        <div
            data-testid="recipe-nutrition-section"
            className="flex flex-col gap-5 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100"
        >
            {hasNutrients && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-neutral-700 uppercase dark:text-neutral-300">
                            <FiActivity
                                size={15}
                                className="shrink-0 text-green-500"
                            />
                            <span>
                                {mounted
                                    ? t('nutrition_per_serving', {
                                          defaultValue: 'Nutrition per serving',
                                      })
                                    : 'Nutrition per serving'}
                            </span>
                        </div>
                        {typeof calories === 'number' && (
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                {calories} kcal
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
                        {nutrients.map((item) => (
                            <div
                                key={item.key}
                                data-testid={`nutrient-${item.key}`}
                                className="flex flex-col items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50/70 px-3 py-2.5 text-center dark:border-neutral-800/80 dark:bg-neutral-800/50"
                            >
                                <span className="text-base font-bold text-neutral-900 dark:text-white">
                                    {item.value}
                                    <span className="ml-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        {item.unit}
                                    </span>
                                </span>
                                <span className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    {mounted
                                        ? t(item.labelKey, {
                                              defaultValue: item.fallbackLabel,
                                          })
                                        : item.fallbackLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasDietaryTags && (
                <div
                    data-testid="recipe-dietary-tags"
                    className={
                        hasNutrients
                            ? 'border-t border-neutral-100 pt-4 dark:border-neutral-800/80'
                            : ''
                    }
                >
                    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                        <FiTag
                            size={13}
                            className="shrink-0 text-green-500"
                        />
                        <span>
                            {mounted
                                ? t('dietary_tags', {
                                      defaultValue: 'Dietary tags',
                                  })
                                : 'Dietary tags'}
                        </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {dietaryTags.map((tag) => {
                            const labelKey = `dietary_${tag.replace(/-/g, '_')}`;
                            const label = String(
                                mounted
                                    ? t(labelKey, { defaultValue: tag })
                                    : tag
                            );
                            return (
                                <span
                                    key={tag}
                                    data-testid={`dietary-tag-${tag}`}
                                    className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-neutral-800"
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeNutritionSection;
