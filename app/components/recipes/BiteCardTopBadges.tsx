'use client';

import React from 'react';
import { FaStar, FaClock, FaFire } from 'react-icons/fa';

interface BiteCardTopBadgesProps {
    averageRating?: number | null;
    minutes?: number;
    calories?: number | null;
}

export const BiteCardTopBadges: React.FC<BiteCardTopBadgesProps> = ({
    averageRating,
    minutes,
    calories,
}) => {
    return (
        <div className="absolute top-5 right-5 z-10 flex flex-wrap items-center gap-2">
            {typeof averageRating === 'number' && averageRating > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md">
                    <FaStar size={13} />
                    <span>{averageRating.toFixed(1)}</span>
                </div>
            )}
            {typeof minutes === 'number' && (
                <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <FaClock
                        size={12}
                        className="text-neutral-300"
                    />
                    <span>{minutes} min</span>
                </div>
            )}
            {Boolean(calories) && (
                <div className="flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-md">
                    <FaFire size={12} />
                    <span>{calories} kcal</span>
                </div>
            )}
        </div>
    );
};

export default BiteCardTopBadges;
