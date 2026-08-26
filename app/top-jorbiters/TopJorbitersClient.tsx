'use client';

import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import LeaderboardHeader from '@/app/components/top-jorbiters/LeaderboardHeader';
import JorbiterCard from '@/app/components/top-jorbiters/JorbiterCard';
import CallToAction from '@/app/components/shared/CallToAction';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';
import { useTranslation } from 'react-i18next';
import JorbiterCardSkeleton from '@/app/components/top-jorbiters/JorbiterCardSkeleton';

export type Timeframe = 'week' | 'month' | 'all';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters: initialTopJorbiters,
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Timeframe>('week');
    const [topJorbiters, setTopJorbiters] = useState<SafeUser[] | undefined>(
        initialTopJorbiters
    );
    const [loading, setLoading] = useState(false);

    const tabs: NavigationTab[] = [
        { id: 'week', label: t('this_week') || 'This week' },
        { id: 'month', label: t('this_month') || 'This month' },
        { id: 'all', label: t('all_time') || 'All time' },
    ];

    const handleTabChange = async (tabId: string) => {
        const timeframe = tabId as Timeframe;
        setActiveTab(timeframe);
        if (timeframe === 'week' && initialTopJorbiters) {
            setTopJorbiters(initialTopJorbiters);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `/api/top-jorbiters?timeframe=${timeframe}`
            );
            if (response.ok) {
                const data = await response.json();
                setTopJorbiters(data);
            }
        } catch (error) {
            // keep existing state on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-lg) sm:px-2 md:px-4">
                <LeaderboardHeader />

                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    className="mb-6"
                />

                {/* Leaderboard Grid */}
                <div className="space-y-4">
                    {loading
                        ? Array.from({ length: 5 }).map((_, index) => (
                              <JorbiterCardSkeleton key={`skeleton-${index}`} />
                          ))
                        : topJorbiters?.map((jorbiter, index) => (
                              <JorbiterCard
                                  key={jorbiter.id}
                                  jorbiter={jorbiter}
                                  index={index}
                              />
                          ))}
                </div>

                <div className="mt-8">
                    <CallToAction
                        currentUser={currentUser}
                        topJorbiters={topJorbiters}
                    />
                </div>
            </div>
        </Container>
    );
};

export default TopJorbitersClient;
