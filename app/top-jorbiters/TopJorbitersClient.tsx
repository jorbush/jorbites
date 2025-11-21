'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import LeaderboardHeader from '@/app/components/top-jorbiters/LeaderboardHeader';
import JorbiterCard from '@/app/components/top-jorbiters/JorbiterCard';
import CallToAction from '@/app/components/shared/CallToAction';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters,
}) => {
    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-lg) sm:px-2 md:px-4">
                <LeaderboardHeader />

                {/* Leaderboard Grid */}
                <div className="space-y-4">
                    {topJorbiters?.map((jorbiter, index) => (
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
