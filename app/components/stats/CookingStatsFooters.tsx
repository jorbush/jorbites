'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowUp } from 'react-icons/fa';

export interface RecipesTrendFooterProps {
    trend: number;
}

export const RecipesTrendFooter: React.FC<RecipesTrendFooterProps> = ({
    trend,
}) => {
    const { t } = useTranslation();

    if (trend <= 0) return null;

    return (
        <div className="flex items-center gap-1.5">
            <span className="border-green-450/30 bg-green-450/20 dark:bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold text-neutral-800">
                <FaArrowUp className="text-green-450 dark:text-green-450 size-2" />
                {trend}%
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">
                {String(t('this_year'))}
            </span>
        </div>
    );
};

export interface LikesFooterProps {
    avgLikes: number;
}

export const LikesFooter: React.FC<LikesFooterProps> = ({ avgLikes }) => {
    const { t } = useTranslation();

    return (
        <span className="text-neutral-500 dark:text-neutral-400">
            {String(t('avg'))}:{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {avgLikes}
            </span>{' '}
            {String(t('per_recipe'))}
        </span>
    );
};

export interface CookingTimeFooterProps {
    totalMinutes: number;
}

export const CookingTimeFooter: React.FC<CookingTimeFooterProps> = ({
    totalMinutes,
}) => {
    const { t } = useTranslation();

    return (
        <span className="text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {totalMinutes}
            </span>{' '}
            {String(t('minutes_total'))}
        </span>
    );
};

export interface ThisYearFooterProps {
    percentage: number;
}

export const ThisYearFooter: React.FC<ThisYearFooterProps> = ({
    percentage,
}) => {
    const { t } = useTranslation();

    return (
        <span className="text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {percentage}%
            </span>{' '}
            {String(t('of_all_recipes'))}
        </span>
    );
};
