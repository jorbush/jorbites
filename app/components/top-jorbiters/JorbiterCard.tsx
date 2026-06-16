'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import { useTranslation } from 'react-i18next';
import RankIcon from '@/app/components/top-jorbiters/RankIcon';
import StatItem from '@/app/components/stats/StatItem';
import VerificationBadge from '@/app/components/VerificationBadge';

interface JorbiterCardProps {
    jorbiter: SafeUser;
    index: number;
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

const JorbiterCard: React.FC<JorbiterCardProps> = ({ jorbiter, index }) => {
    const { push } = useRouter() || {};
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');
    const { t } = useTranslation();

    return (
        <div
            className={`dark:bg-dark relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-700 ${
                index < 3
                    ? 'border-2 ' +
                      getMedalColor(index).replace('text', 'border')
                    : ''
            }`}
        >
            <div className="flex items-center justify-between">
                {/* Left section - Avatar and Basic Info */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <div className="flex items-center justify-center">
                        <RankIcon rank={index} />
                    </div>
                    <div className="relative z-10">
                        <Avatar
                            src={jorbiter.image}
                            size={50}
                            onClick={() => push('/profile/' + jorbiter.id)}
                            extraClasses="sm:size-[65px] md:size-[70px]"
                            quality="auto:best"
                        />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <div className="flex flex-row items-center gap-1">
                            <div className="max-w-[50vw] truncate text-base font-semibold sm:max-w-[45vw] sm:text-xl md:max-w-[35vw] md:text-2xl lg:max-w-[30vw] dark:text-white">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        push('/profile/' + jorbiter.id);
                                    }}
                                    className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:underline focus:outline-hidden"
                                >
                                    {getUserDisplayName(
                                        jorbiter,
                                        isMdOrSmaller,
                                        isSmOrSmaller
                                    )}
                                </button>
                            </div>
                            {jorbiter.verified && (
                                <VerificationBadge
                                    className={
                                        isMdOrSmaller ? 'text-lg' : 'text-xl'
                                    }
                                />
                            )}
                        </div>
                        <div className="sm:text-md text-sm text-neutral-400 md:text-lg">
                            {`${t('level')} ${jorbiter.level}`}
                        </div>
                    </div>
                </div>

                {/* Right section - Stats */}
                <div
                    className={`flex items-end gap-0 md:gap-6 ${
                        isSmOrSmaller
                            ? 'flex-col sm:gap-1'
                            : 'flex-row sm:gap-6'
                    }`}
                >
                    <StatItem
                        value={jorbiter.recipeCount || 0}
                        label={t('recipes')}
                        flexDirection={isSmOrSmaller ? 'row' : 'col'}
                    />
                    <StatItem
                        value={jorbiter.likesReceived || 0}
                        label={t('favorites')}
                        flexDirection={isSmOrSmaller ? 'row' : 'col'}
                    />
                    {jorbiter.badges && (
                        <StatItem
                            value={jorbiter.badges.length}
                            label={t('badges')}
                            flexDirection={isSmOrSmaller ? 'row' : 'col'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default JorbiterCard;
