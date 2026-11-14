'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import CookingStatsSection from '@/app/components/stats/CookingStatsSection';
import CookingPreferencesSection from '@/app/components/stats/CookingPreferencesSection';

export interface UserStatsProps {
    user?: SafeUser | null;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
    if (!user) return null;

    const recipeCount = user.recipeCount || 0;

    return (
        <Container>
            {recipeCount > 0 && (
                <div className="py-4">
                    <CookingStatsSection
                        user={user}
                        recipeCount={recipeCount}
                    />
                    <CookingPreferencesSection user={user} />
                </div>
            )}
        </Container>
    );
};

export default UserStats;
