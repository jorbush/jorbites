'use client';

import React from 'react';
import { FaHeart, FaTimes, FaEye } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface BiteCardGestureBadgesProps {
    rightOpacity: number;
    leftOpacity: number;
    upOpacity: number;
}

export const BiteCardGestureBadges: React.FC<BiteCardGestureBadgesProps> = ({
    rightOpacity,
    leftOpacity,
    upOpacity,
}) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Right / Save Badge */}
            <div
                style={{ opacity: rightOpacity }}
                className="border-green-450 bg-green-450/20 text-green-450 pointer-events-none absolute top-8 left-8 z-10 flex -rotate-12 transform items-center gap-2 rounded-2xl border-4 px-5 py-2 text-2xl font-black tracking-wider uppercase backdrop-blur-md transition-opacity duration-75"
            >
                <FaHeart className="text-green-450" />
                {t('bite_cards_save')}
            </div>

            {/* Left / Skip Badge */}
            <div
                style={{ opacity: leftOpacity }}
                className="pointer-events-none absolute top-8 right-8 z-10 flex rotate-12 transform items-center gap-2 rounded-2xl border-4 border-rose-500 bg-rose-500/20 px-5 py-2 text-2xl font-black tracking-wider text-rose-400 uppercase backdrop-blur-md transition-opacity duration-75"
            >
                <FaTimes className="text-rose-400" />
                {t('bite_cards_skip')}
            </div>

            {/* Up / View Badge */}
            <div
                style={{ opacity: upOpacity }}
                className="pointer-events-none absolute bottom-36 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl border-4 border-amber-400 bg-amber-400/20 px-5 py-2 text-2xl font-black tracking-wider text-amber-300 uppercase backdrop-blur-md transition-opacity duration-75"
            >
                <FaEye className="text-amber-300" />
                {t('bite_cards_view')}
            </div>
        </>
    );
};

export default BiteCardGestureBadges;
