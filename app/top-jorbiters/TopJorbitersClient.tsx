'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import LeaderboardHeader from '@/app/components/top-jorbiters/LeaderboardHeader';
import JorbiterCard from '@/app/components/top-jorbiters/JorbiterCard';
import CallToAction from '@/app/components/utils/CallToAction';
import useRecipeModal from '../hooks/useRecipeModal';
import { t } from 'i18next';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters,
}) => {
    const recipeModal = useRecipeModal();

    // Only use currentUser for call-to-action logic

    const userRank = currentUser
        ? topJorbiters?.findIndex((j) => j.id === currentUser.id)
        : undefined;
    const isRanked = userRank !== -1 && userRank !== undefined;
    const isFirstPlace = userRank === 0;

    const renderCallToAction = () => {
        if (!currentUser) {
            return null;
        }
        if (!isRanked) {
            return (
                <CallToAction
                    icon="🏆"
                    title={t('call_to_action_ranked_title')}
                    subtitle={t('call_to_action_ranked_subtitle')}
                    buttonText={t('post_recipe')}
                    onClick={() => recipeModal.onOpen()}
                />
            );
        }

        if (isRanked && !isFirstPlace) {
            return (
                <CallToAction
                    icon="🚀"
                    title={t('call_to_action_first_place_title')}
                    subtitle={t('call_to_action_first_place_subtitle')}
                    buttonText={t('post_recipe')}
                    onClick={() => recipeModal.onOpen()}
                />
            );
        }

        return null;
    };
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

                {renderCallToAction()}
            </div>
        </Container>
    );
};

export default TopJorbitersClient;
