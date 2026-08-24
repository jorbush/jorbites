'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash } from 'react-icons/fi';
import StarRating from '@/app/components/utils/StarRating';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentRatingSectionProps {
    rating: number | null;
    showRating: boolean;
    onChange: (rating: number | null) => void;
    onClear: () => void;
}

const CommentRatingSection: React.FC<CommentRatingSectionProps> = ({
    rating,
    showRating,
    onChange,
    onClear,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    return (
        <div
            className={`overflow-hidden transition-all duration-200 ${
                showRating || rating !== null
                    ? 'mt-2 max-h-12 border-t border-neutral-200/60 pt-2 opacity-100 dark:border-neutral-700/60'
                    : 'pointer-events-none max-h-0 opacity-0'
            }`}
        >
            <div className="flex items-center gap-1.5">
                <StarRating
                    rating={rating || 0}
                    interactive
                    onChange={onChange}
                    size={16}
                />
                {rating !== null && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex cursor-pointer items-center justify-center rounded-full p-0.5 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400"
                        data-testid="clear-rating"
                        aria-label={
                            mounted
                                ? String(t('clear_rating') || 'Clear rating')
                                : 'Clear rating'
                        }
                    >
                        <FiTrash size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CommentRatingSection;
