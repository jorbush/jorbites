'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeRecipe, SafeUser, ProfilePreferences } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import Container from '@/app/components/utils/Container';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { OrderByType } from '@/app/utils/filter';
import { FiBookOpen } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ProfileRecipesContent from '@/app/components/profile/ProfileRecipesContent';
import ProfileBlogsContent from '@/app/components/profile/ProfileBlogsContent';
import UserStats from '@/app/components/stats/UserStats';
import ActivityHeatmap, {
    ActivityItem,
} from '@/app/components/profile/ActivityHeatmap';
import { getProfilePreferences } from '@/app/utils/profile-utils';

interface SearchParams {
    orderBy?: OrderByType;
    page?: string;
    tab?: string;
}

interface ProfileClientProps {
    recipes: SafeRecipe[];
    pinnedRecipes?: SafeRecipe[];
    currentUser?: SafeUser | null;
    totalPages: number;
    currentPage: number;
    totalRecipes?: number;
    searchParams: SearchParams;
    profileUserId: string;
    blogs?: Blog[];
    user?: SafeUser | null;
    profileUser?: SafeUser | null;
    profilePreferences?: ProfilePreferences | null;
    graphRecipes?: Array<{
        id: string;
        createdAt: string;
        questId?: string | null;
    }>;
    comments?: Array<{
        id: string;
        createdAt: string;
        isCooked?: boolean;
        rating?: number | null;
        comment?: string;
    }>;
    challengeSubmissions?: Array<{ id: string; createdAt: string }>;
    activities?: ActivityItem[];
}

const EMPTY_RECIPES: SafeRecipe[] = [];
const EMPTY_BLOGS: Blog[] = [];

const getInitialTab = (
    tabParam?: string,
    recipesCount = 0,
    blogsCount = 0
): string => {
    if (tabParam === 'blogs' || tabParam === 'articles') return 'blogs';
    if (tabParam === 'recipes') return 'recipes';
    if (recipesCount === 0 && blogsCount > 0) return 'blogs';
    return 'recipes';
};

const ProfileClient: React.FC<ProfileClientProps> = ({
    recipes,
    pinnedRecipes = EMPTY_RECIPES,
    currentUser,
    totalPages,
    currentPage,
    searchParams,
    profileUserId,
    blogs = EMPTY_BLOGS,
    user,
    profileUser,
    profilePreferences,
    graphRecipes,
    comments,
    challengeSubmissions,
    activities,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const isOwnProfile = Boolean(
        currentUser && currentUser.id === profileUserId
    );

    const targetUser =
        user ||
        profileUser ||
        (currentUser && currentUser.id === profileUserId ? currentUser : null);

    const preferences = profilePreferences || getProfilePreferences(targetUser);

    const showStats = preferences.showStats ?? true;
    const showActivityGraph = preferences.showActivityGraph ?? true;
    const showArticles = preferences.showArticles ?? true;

    const [activeTab, setActiveTab] = useState<string>(() => {
        const initial = getInitialTab(
            searchParams?.tab,
            recipes.length + pinnedRecipes.length,
            blogs.length
        );
        if (!showArticles && initial === 'blogs') {
            return 'recipes';
        }
        return initial;
    });

    const handleTabChange = (tabId: string) => {
        if (!showArticles && tabId === 'blogs') {
            return;
        }
        setActiveTab(tabId);
        const params = new URLSearchParams(
            typeof window !== 'undefined' ? window.location.search : ''
        );
        params.set('tab', tabId);
        params.delete('page');
        const query = params.toString();
        router.push(query ? `?${query}` : '?', { scroll: false });
    };

    const tabs: Tab[] = [
        {
            id: 'recipes',
            label: t('recipes') || 'Recipes',
            icon: <MdRestaurantMenu size={20} />,
        },
        ...(showArticles
            ? [
                  {
                      id: 'blogs',
                      label: t('blogs') || 'Blogs',
                      icon: <FiBookOpen size={18} />,
                  },
              ]
            : []),
    ];

    return (
        <>
            {showStats && targetUser && (
                <div data-testid="profile-cooking-statistics">
                    <UserStats user={targetUser} />
                </div>
            )}

            {showActivityGraph && (
                <div data-testid="profile-activity-graph">
                    <ActivityHeatmap
                        recipes={graphRecipes || []}
                        comments={comments}
                        challengeSubmissions={challengeSubmissions}
                        activities={activities}
                    />
                </div>
            )}

            <Container>
                <div className="mt-2 mb-8">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        data-testid="profile-tabs"
                    />
                </div>

                {activeTab === 'recipes' && (
                    <ProfileRecipesContent
                        recipes={recipes}
                        pinnedRecipes={pinnedRecipes}
                        currentUser={currentUser}
                        isOwnProfile={isOwnProfile}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        searchParams={searchParams}
                    />
                )}

                {activeTab === 'blogs' && showArticles && (
                    <ProfileBlogsContent
                        blogs={blogs}
                        searchParams={searchParams}
                    />
                )}
            </Container>
        </>
    );
};

export default ProfileClient;
