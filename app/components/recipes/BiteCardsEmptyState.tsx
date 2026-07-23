'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaRedo } from 'react-icons/fa';

interface BiteCardsEmptyStateProps {
    onDiscoverNew: () => void;
}

export const BiteCardsEmptyState: React.FC<BiteCardsEmptyStateProps> = ({
    onDiscoverNew,
}) => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="bite-cards-empty-state"
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900 to-black p-6 text-center text-white shadow-xl"
        >
            <div className="bg-green-450/20 border-green-450 text-green-450 flex size-16 items-center justify-center rounded-full border-2 text-2xl shadow-lg">
                🎉
            </div>
            <div className="space-y-1.5">
                <h2 className="text-xl font-black tracking-tight text-white">
                    {t('bite_cards_all_caught_up')}
                </h2>
                <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
                    {t('bite_cards_all_caught_up_desc')}
                </p>
            </div>
            <button
                type="button"
                onClick={onDiscoverNew}
                data-testid="bite-cards-discover-btn"
                className="bg-green-450 mt-1 flex transform cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-neutral-900 shadow-lg transition hover:bg-[#b0e88b] active:scale-95"
            >
                <FaRedo size={13} /> {t('bite_cards_discover')}
            </button>
        </div>
    );
};

export default BiteCardsEmptyState;
