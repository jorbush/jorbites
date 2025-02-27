'use client';

import React from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';

interface RankIconProps {
    rank: number;
}

const RankIcon: React.FC<RankIconProps> = ({ rank }) => {
    const getMedalColor = (index: number) => {
        switch (index) {
            case 0:
                return 'text-yellow-400';
            case 1:
                return 'text-gray-400';
            case 2:
                return 'text-amber-600';
            default:
                return 'text-gray-300';
        }
    };

    if (rank === 0) {
        return <FaTrophy className={`${getMedalColor(rank)} text-2xl`} />;
    }

    if (rank <= 2) {
        return <FaMedal className={`${getMedalColor(rank)} text-2xl`} />;
    }

    return <span className="text-xl font-bold text-gray-400">#{rank + 1}</span>;
};

export default RankIcon;
