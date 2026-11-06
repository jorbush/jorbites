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
    const { push } = useRouter() || {};
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');
    const { t } = useTranslation();

    const getPodiumStyles = () => {
        switch (index) {
            case 0:
                return 'border-2 border-yellow-400 bg-gradient-to-r from-yellow-400/10 via-white to-white dark:via-neutral-900/90 dark:to-neutral-900/90';
            case 1:
                return 'border-2 border-neutral-400 bg-gradient-to-r from-neutral-200/40 via-white to-white dark:from-neutral-700/20 dark:via-neutral-900/90 dark:to-neutral-900/90';
            case 2:
                return 'border-2 border-amber-600 bg-gradient-to-r from-amber-600/10 via-white to-white dark:via-neutral-900/90 dark:to-neutral-900/90';
            default:
                return 'border border-neutral-200/80 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700';
        }
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-4 shadow-xs transition-colors duration-200 sm:p-5 ${getPodiumStyles()}`}
        >
            <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between md:gap-4">
                {/* Left section - Rank, Avatar and Basic Info */}
                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200/60 bg-neutral-50 shadow-2xs md:size-10 dark:border-neutral-800 dark:bg-neutral-800/60">
                        <RankIcon rank={index} />
                    </div>
                    <div className="relative z-10 shrink-0">
                        <Avatar
                            src={jorbiter.image}
                            size={48}
                            onClick={() => push('/profile/' + jorbiter.id)}
                            extraClasses="size-11 md:size-14 ring-2 ring-neutral-100 dark:ring-neutral-800"
                            quality="auto:best"
                        />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-1.5">
                            <div className="truncate text-base font-bold text-neutral-900 md:text-lg dark:text-white">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        push('/profile/' + jorbiter.id);
                                    }}
                                    className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left transition-colors duration-200 after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-hidden"
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
                                    size={isMdOrSmaller ? 18 : 20}
                                    className="text-green-450 shrink-0"
                                />
                            )}
                        </div>
                        <div className="text-xs whitespace-nowrap text-neutral-500 md:text-sm dark:text-neutral-400">
                            {`${t('level')} ${jorbiter.level}`}
                        </div>
                    </div>
                </div>

                {/* Right section - Stats Shelf */}
                <div className="flex w-full items-center justify-around rounded-xl border border-neutral-100/80 bg-neutral-50/70 px-3 py-2.5 md:w-auto md:justify-end md:gap-6 md:border-0 md:bg-transparent md:p-0 dark:border-neutral-800/60 dark:bg-neutral-800/50 md:dark:bg-transparent">
                    <StatItem
                        value={jorbiter.recipeCount || 0}
                        label={t('recipes')}
                        flexDirection="col"
                    />
                    <StatItem
                        value={jorbiter.likesReceived || 0}
                        label={t('favorites')}
                        flexDirection="col"
                    />
                    {jorbiter.badges && (
                        <StatItem
                            value={jorbiter.badges.length}
                            label={t('badges')}
                            flexDirection="col"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default JorbiterCard;
