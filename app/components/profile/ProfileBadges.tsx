'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import Badge from '@/app/components/utils/Badge';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';

interface ProfileBadgesProps {
    badges?: string[] | null;
}

const handleBadgeClick = () => {
    confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6 },
    });
};

const getBadgeSrc = (badge: string) => {
    if (badge.startsWith('/') || badge.startsWith('http')) return badge;
    if (
        badge.endsWith('.webp') ||
        badge.endsWith('.jpg') ||
        badge.endsWith('.png')
    ) {
        return `/badges/${badge}`;
    }
    return `/badges/${badge}.webp`;
};

const isQuestBadge = (badge: string) => {
    return badge.startsWith('quest_solver_') || badge.includes('quest_solver');
};

const isCooksnapBadge = (badge: string) => {
    return (
        badge.startsWith('kitchen_explorer_') ||
        badge.includes('kitchen_explorer') ||
        badge.startsWith('cooksnap_master_') ||
        badge.includes('cooksnap_master')
    );
};

const getBadgeTooltip = (badge: string) => {
    if (badge.includes('quest_solver_10')) {
        return 'Quest Veteran (Silver) - 10 Quests Fulfilled';
    }
    if (badge.includes('quest_solver_25')) {
        return 'Quest Master (Gold) - 25 Quests Fulfilled';
    }
    if (badge.includes('quest_solver_1')) {
        return 'Quest Solver (Bronze) - 1 Quest Fulfilled';
    }
    if (badge.includes('cooksnap_master_15')) {
        return 'Cooksnap Master (Gold) - 15 Dishes Cooked';
    }
    if (badge.includes('cooksnap_master_5')) {
        return 'Cooksnap Veteran (Silver) - 5 Dishes Cooked';
    }
    if (badge.includes('kitchen_explorer_1')) {
        return 'Kitchen Explorer (Bronze) - 1 Dish Cooked';
    }
    return `${badge.replace(/\.(webp|png|jpg)$/, '').replace(/_/g, ' ')} badge`;
};

const ProfileBadges: React.FC<ProfileBadgesProps> = ({ badges }) => {
    const { push } = useRouter();
    const { t } = useTranslation();

    if (!badges || !Array.isArray(badges) || badges.length === 0) {
        return null;
    }

    const onBadgeClick = (badge: string) => {
        if (isQuestBadge(badge)) {
            push('/events/quest_badges');
        } else if (isCooksnapBadge(badge)) {
            push('/events/cooksnap_badges');
        } else {
            handleBadgeClick();
        }
    };

    return (
        <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-xs sm:p-4 dark:border-neutral-800 dark:bg-neutral-800">
            <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    {t('badges')} ({badges.length})
                </span>
            </div>
            <ScrollableContainer>
                {badges.map((badge) => (
                    <Badge
                        key={badge}
                        src={getBadgeSrc(badge)}
                        alt={`${badge} badge`}
                        tooltipText={getBadgeTooltip(badge)}
                        onClick={() => onBadgeClick(badge)}
                        size={48}
                    />
                ))}
            </ScrollableContainer>
        </div>
    );
};

export default ProfileBadges;
