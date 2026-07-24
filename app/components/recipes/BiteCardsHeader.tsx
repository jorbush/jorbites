'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface BiteCardsHeaderProps {
    currentIndex: number;
    totalRecipes: number;
}

export const BiteCardsHeader: React.FC<BiteCardsHeaderProps> = ({
    currentIndex,
    totalRecipes,
}) => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="bite-cards-header"
            className="mb-3 flex w-full flex-shrink-0 items-center justify-between px-1"
        >
            <div className="flex items-center gap-2">
                <span className="bg-green-450 flex size-2.5 animate-pulse rounded-full" />
                <h1 className="text-base font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t('bite_cards_title')}
                </h1>
            </div>
            {totalRecipes > 0 && currentIndex < totalRecipes && (
                <span
                    data-testid="bite-cards-counter"
                    className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                >
                    {currentIndex + 1} / {totalRecipes}
                </span>
            )}
        </div>
    );
};

export default BiteCardsHeader;
