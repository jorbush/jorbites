'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentRateButtonProps {
    rating: number | null;
    showRating: boolean;
    onToggleRating: () => void;
}

const CommentRateButton: React.FC<CommentRateButtonProps> = ({
    rating,
    showRating,
    onToggleRating,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const isActive = rating !== null || showRating;
    const translatedRate = t('rate');
    const label =
        mounted && translatedRate && translatedRate !== 'rate'
            ? String(translatedRate)
            : 'Rate';

    const buttonClass = isActive
        ? 'border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300'
        : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60';

    return (
        <button
            type="button"
            onClick={onToggleRating}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors duration-200 select-none ${buttonClass}`}
            data-testid="rate-toggle-btn"
            title={label}
        >
            {isActive ? (
                <AiFillStar
                    size={15}
                    className="text-amber-500"
                />
            ) : (
                <AiOutlineStar
                    size={15}
                    className="text-neutral-500 dark:text-neutral-400"
                />
            )}
            <span className="hidden text-xs font-semibold md:inline">
                {label}
            </span>
        </button>
    );
};

export default CommentRateButton;
