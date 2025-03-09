'use client';

import StatItem from '@/app/components/stats/StatItem';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';

const UserOtherStats = ({ user }: { user?: SafeUser | null }) => {
    const { t } = useTranslation();
    return (
        <>
            <hr className="mx-2 my-2 mt-6" />
            <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                <StatItem
                    value={user?.recipesThisYear || 0}
                    label={t('recipes_this_year')}
                    flexDirection="row"
                />
                <StatItem
                    value={user?.likesReceived || 0}
                    label={t('favorites')}
                    flexDirection="row"
                />
                <StatItem
                    value={user?.avgLikesPerRecipe || 0}
                    label={t('avg_likes_per_recipe')}
                    flexDirection="row"
                />
                <StatItem
                    value={user?.totalCookingTime || 0}
                    label={t('total_cooking_time')}
                    flexDirection="row"
                />
                <StatItem
                    value={t(user?.mostUsedCategory?.toLowerCase() || '') || ''}
                    label={t('most_used_category')}
                    flexDirection="row"
                />
                <StatItem
                    value={t(user?.mostUsedMethod?.toLowerCase() || '') || ''}
                    label={t('most_used_method')}
                    flexDirection="row"
                />
            </div>
        </>
    );
};

export default UserOtherStats;
