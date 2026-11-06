'use client';

import React from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';

interface RankIconProps {
    rank: number;
}

const getMedalColor = (index: number) => {
    switch (index) {
        case 0:
            return 'text-yellow-400';
        case 1:
            return 'text-neutral-400';
        case 2:
            return 'text-amber-600';
        default:
            return 'text-neutral-300';
    }
};

const RankIcon: React.FC<RankIconProps> = ({ rank }) => {
    if (rank === 0) {
        return (
            <FaTrophy
                className={`${getMedalColor(rank)} text-xl sm:text-2xl`}
            />
        );
    }

    if (rank <= 2) {
        return (
            <FaMedal className={`${getMedalColor(rank)} text-xl sm:text-2xl`} />
        );
    }

    return (
        <span className="text-sm font-bold tracking-tight text-neutral-400 sm:text-base dark:text-neutral-500">
            #{rank + 1}
        </span>
    );
};

export default RankIcon;
