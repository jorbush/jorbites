'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaTimes, FaEye, FaUndo } from 'react-icons/fa';

interface BiteCardsControlsProps {
    canUndo: boolean;
    onUndo: () => void;
    onSkip: () => void;
    onView: () => void;
    onFavorite: () => void;
}

export const BiteCardsControls: React.FC<BiteCardsControlsProps> = ({
    canUndo,
    onUndo,
    onSkip,
    onView,
    onFavorite,
}) => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="bite-cards-controls"
            className="relative z-5 mt-2 flex w-full flex-shrink-0 items-center justify-center gap-4"
        >
            {/* Undo Button */}
            <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                data-testid="bite-cards-undo-btn"
                className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-neutral-200 text-neutral-700 shadow-md transition hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 dark:bg-neutral-800 dark:text-neutral-300"
                title={t('bite_cards_undo') as string}
            >
                <FaUndo size={15} />
            </button>

            {/* Skip / Left Button */}
            <button
                type="button"
                onClick={onSkip}
                data-testid="bite-cards-skip-btn"
                className="flex size-13 cursor-pointer items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500/10 text-rose-500 shadow-md transition hover:scale-110 hover:bg-rose-500 hover:text-white active:scale-95"
                title={t('bite_cards_skip_action') as string}
            >
                <FaTimes size={20} />
            </button>

            {/* View / Details Up Button */}
            <button
                type="button"
                onClick={onView}
                data-testid="bite-cards-view-btn"
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/10 text-amber-500 shadow-md transition hover:scale-110 hover:bg-amber-500 hover:text-white active:scale-95"
                title={t('bite_cards_view_recipe') as string}
            >
                <FaEye size={17} />
            </button>

            {/* Save / Favorite Right Button */}
            <button
                type="button"
                onClick={onFavorite}
                data-testid="bite-cards-favorite-btn"
                className="bg-green-450 shadow-green-450/40 flex size-15 cursor-pointer items-center justify-center rounded-full font-extrabold text-neutral-900 shadow-lg transition hover:scale-110 hover:bg-[#b0e88b] active:scale-95"
                title={t('bite_cards_save_favorites') as string}
            >
                <FaHeart
                    size={24}
                    className="text-neutral-900"
                />
            </button>
        </div>
    );
};

export default BiteCardsControls;
