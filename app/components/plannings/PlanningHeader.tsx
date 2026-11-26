'use client';

import React, { useMemo } from 'react';
import { SafePlanning } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import { FiActivity, FiAlertCircle } from 'react-icons/fi';
import VerificationBadge from '@/app/components/VerificationBadge';
import {
    aggregateWeeklyNutrition,
    hasAnyMacro,
    PlanningMealLike,
} from '@/app/utils/planningNutrition';

const EMPTY_MEALS: PlanningMealLike[] = [];

export interface PlanningHeaderProps {
    editedName: string;
    editedDesc: string;
    planning: SafePlanning;
    language: string;
    isOwner: boolean;
    isPrivate: boolean;
    isSaving: boolean;
    togglePrivacy: () => void;
    push: (url: string) => void;
    t: any;
    mealsCount?: number;
    meals?: PlanningMealLike[];
    showLock?: boolean;
}

interface AverageMacroItem {
    key: string;
    testId: string;
    value: number;
    unit: string;
    label: string;
    isPrimary?: boolean;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({
    editedName,
    editedDesc,
    planning,
    language,
    isOwner,
    isPrivate,
    isSaving,
    togglePrivacy,
    push,
    t,
    mealsCount,
    meals,
    showLock = true,
}) => {
    const effectiveMeals = meals ?? planning.meals ?? EMPTY_MEALS;

    const weeklySummary = useMemo(
        () => aggregateWeeklyNutrition(effectiveMeals),
        [effectiveMeals]
    );

    const averageMacroItems = useMemo<AverageMacroItem[]>(() => {
        const { dailyAverages } = weeklySummary;
        const items: AverageMacroItem[] = [];

        if (dailyAverages.calories !== null) {
            items.push({
                key: 'calories',
                testId: 'weekly-avg-calories',
                value: dailyAverages.calories,
                unit: 'kcal',
                label: String(
                    t('calories', { defaultValue: 'Calories' }) || 'Calories'
                ),
                isPrimary: true,
            });
        }
        if (dailyAverages.protein !== null) {
            items.push({
                key: 'protein',
                testId: 'weekly-avg-protein',
                value: dailyAverages.protein,
                unit: 'g',
                label: String(
                    t('protein', { defaultValue: 'Protein' }) || 'Protein'
                ),
            });
        }
        if (dailyAverages.carbohydrates !== null) {
            items.push({
                key: 'carbohydrates',
                testId: 'weekly-avg-carbohydrates',
                value: dailyAverages.carbohydrates,
                unit: 'g',
                label: String(
                    t('carbohydrates', { defaultValue: 'Carbs' }) || 'Carbs'
                ),
            });
        }
        if (dailyAverages.fat !== null) {
            items.push({
                key: 'fat',
                testId: 'weekly-avg-fat',
                value: dailyAverages.fat,
                unit: 'g',
                label: String(t('fat', { defaultValue: 'Fat' }) || 'Fat'),
            });
        }
        if (dailyAverages.fiber !== null) {
            items.push({
                key: 'fiber',
                testId: 'weekly-avg-fiber',
                value: dailyAverages.fiber,
                unit: 'g',
                label: String(t('fiber', { defaultValue: 'Fiber' }) || 'Fiber'),
            });
        }

        return items;
    }, [weeklySummary, t]);

    const hasDailyAverages =
        weeklySummary.populatedDays > 0 &&
        hasAnyMacro(weeklySummary.dailyAverages);
    const hasAllergens = weeklySummary.allergens.length > 0;

    return (
        <div className="flex w-full flex-col">
            {/* Fallback lock for standalone tests */}
            {showLock && isOwner && togglePrivacy && (
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={togglePrivacy}
                        disabled={isSaving}
                        data-cy="toggle-plan-privacy"
                        aria-label={String(
                            (isPrivate ? t('private') : t('public')) || ''
                        )}
                        title={String(
                            (isPrivate ? t('private') : t('public')) || ''
                        )}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    >
                        {isPrivate ? (
                            <GiPadlock
                                size={16}
                                className="text-neutral-700 dark:text-neutral-300"
                                data-testid="lock-icon"
                            />
                        ) : (
                            <GiPadlockOpen
                                size={16}
                                className="text-neutral-700 dark:text-neutral-300"
                                data-testid="lock-open-icon"
                            />
                        )}
                    </button>
                </div>
            )}

            {/* Plan Title & Date */}
            <div className="mb-5">
                <h1
                    className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                    data-cy="plan-title"
                >
                    {editedName}
                </h1>
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(planning.createdAt, language)}
                </p>
                {editedDesc && (
                    <p
                        className="mt-3 text-sm text-neutral-600 dark:text-neutral-400"
                        data-cy="plan-description"
                    >
                        {editedDesc}
                    </p>
                )}
            </div>

            {/* Bottom shelf: Chef User & Meals Count */}
            <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                {planning.user ? (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={planning.user.image}
                            size={42}
                            onClick={() =>
                                push(`/profile/${planning.user!.id}`)
                            }
                            quality="auto:eco"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left text-base font-semibold text-neutral-900 transition-colors duration-200 focus:outline-hidden sm:text-lg dark:text-white"
                                    onClick={() =>
                                        push(`/profile/${planning.user!.id}`)
                                    }
                                >
                                    {planning.user.name}
                                </button>
                                {planning.user.verified && (
                                    <VerificationBadge size={18} />
                                )}
                            </div>
                            {typeof planning.user.level === 'number' && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {`${t('level')} ${planning.user.level}`}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div />
                )}

                <div className="self-end text-xs font-medium text-neutral-500 sm:self-auto dark:text-neutral-400">
                    {`${mealsCount ?? effectiveMeals.length} ${t('meals')}`}
                </div>
            </div>

            {/* Weekly Macro Averages & Plan-wide EU-14 Allergens */}
            {(hasDailyAverages || hasAllergens) && (
                <div
                    data-testid="planning-nutrition-summary"
                    className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800"
                >
                    {hasDailyAverages && (
                        <div
                            data-testid="weekly-macro-averages"
                            className="flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                                <FiActivity
                                    size={14}
                                    className="text-green-450 shrink-0"
                                    aria-hidden="true"
                                />
                                <span>
                                    {String(
                                        t('daily_average_macros', {
                                            defaultValue: 'Daily average',
                                        }) || 'Daily average'
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {averageMacroItems.map((item) => (
                                    <div
                                        key={item.key}
                                        data-testid={item.testId}
                                        className={
                                            item.isPrimary
                                                ? 'border-green-450/40 bg-green-450/15 dark:border-green-450/30 dark:bg-green-450/10 inline-flex items-baseline gap-1.5 rounded-xl border px-3 py-1.5 text-xs'
                                                : 'inline-flex items-baseline gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3 py-1.5 text-xs dark:border-neutral-800/80 dark:bg-neutral-800/50'
                                        }
                                    >
                                        <span
                                            className={
                                                item.isPrimary
                                                    ? 'dark:text-green-450 font-bold text-neutral-900'
                                                    : 'font-bold text-neutral-900 dark:text-white'
                                            }
                                        >
                                            {item.value}
                                            {item.unit === 'kcal'
                                                ? ' kcal'
                                                : item.unit}
                                        </span>
                                        <span className="font-medium text-neutral-500 dark:text-neutral-400">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasAllergens && (
                        <div
                            data-testid="plan-allergens-summary"
                            className="flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                                <FiAlertCircle
                                    size={14}
                                    className="shrink-0 text-amber-600 dark:text-amber-400"
                                    aria-hidden="true"
                                />
                                <span>
                                    {String(
                                        t('plan_allergens', {
                                            defaultValue: 'Plan allergens',
                                        }) || 'Plan allergens'
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {weeklySummary.allergens.map((allergen) => {
                                    const Icon = allergen.icon;
                                    const label = String(
                                        t(`allergen_${allergen.id}`, {
                                            defaultValue: allergen.id,
                                        }) || allergen.id
                                    );
                                    const tooltip =
                                        allergen.recipeTitles.length > 0
                                            ? `${label}: ${allergen.recipeTitles.join(', ')}`
                                            : label;

                                    return (
                                        <span
                                            key={allergen.id}
                                            data-testid={`plan-allergen-badge-${allergen.id}`}
                                            title={String(tooltip)}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200"
                                        >
                                            <Icon
                                                size={13}
                                                className="shrink-0 text-amber-700 dark:text-amber-300"
                                                aria-hidden="true"
                                            />
                                            <span>{label}</span>
                                        </span>
                                    );
                                })}
                            </div>
                            <p
                                className="text-xs text-neutral-500 dark:text-neutral-400"
                                data-testid="plan-allergen-disclaimer"
                            >
                                {String(
                                    t('allergen_disclaimer', {
                                        defaultValue:
                                            'Automatically estimated from recipe ingredients and tags — may be incomplete. Always verify ingredients for food allergies.',
                                    }) ||
                                        'Automatically estimated from recipe ingredients and tags — may be incomplete. Always verify ingredients for food allergies.'
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
