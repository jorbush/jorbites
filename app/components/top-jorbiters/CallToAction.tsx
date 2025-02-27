'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import { t } from 'i18next';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import ActionCard from './ActionCard';

interface CallToActionProps {
    currentUser: SafeUser | null | undefined;
    topJorbiters: SafeUser[] | undefined;
}

const CallToAction: React.FC<CallToActionProps> = ({
    currentUser,
    topJorbiters,
}) => {
    const recipeModal = useRecipeModal();

    if (!currentUser) return null;

    const userRank = topJorbiters?.findIndex((j) => j.id === currentUser.id);
    const isRanked = userRank !== -1 && userRank !== undefined;
    const isFirstPlace = userRank === 0;

    if (!isRanked) {
        return (
            <ActionCard
                title={t('call_to_action_ranked_title')}
                subtitle={t('call_to_action_ranked_subtitle')}
                buttonText={t('post_recipe')}
                onClick={() => recipeModal.onOpen()}
            />
        );
    }

    if (isRanked && !isFirstPlace) {
        return (
            <ActionCard
                title={t('call_to_action_first_place_title')}
                subtitle={t('call_to_action_first_place_subtitle')}
                buttonText={t('post_recipe')}
                onClick={() => recipeModal.onOpen()}
            />
        );
    }

    return null;
};

export default CallToAction;
