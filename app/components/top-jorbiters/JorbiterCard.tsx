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

const JorbiterCard: React.FC<JorbiterCardProps> = ({ jorbiter, index }) => {
    const router = useRouter();
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');
    const { t } = useTranslation();

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

    return (
        <div
            className={`dark:bg-dark relative cursor-pointer overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 ${
                index < 3
                    ? 'border-2 ' +
                      getMedalColor(index).replace('text', 'border')
                    : ''
            }`}
            onClick={() => router.push('/profile/' + jorbiter.id)}
        >
            <div className="flex items-center justify-between">
                {/* Left section - Avatar and Basic Info */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center justify-center">
                        <RankIcon rank={index} />
                    </div>
                    <div className="relative">
                        <Avatar
                            src={jorbiter.image}
                            size={50}
                            onClick={() =>
                                router.push('/profile/' + jorbiter.id)
                            }
                            extraClasses="sm:h-[65px] sm:w-[65px] md:h-[70px] md:w-[70px]"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-1">
                            <div className="text-base font-semibold sm:text-xl md:text-2xl dark:text-white">
                                {getUserDisplayName(
                                    jorbiter,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </div>
                            {jorbiter.verified && (
                                <VerificationBadge
                                    className={
                                        isMdOrSmaller ? 'text-lg' : 'text-xl'
                                    }
                                />
                            )}
                        </div>
                        <div className="sm:text-md text-sm text-gray-400 md:text-lg">
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
