'use client';

import React from 'react';
import { SafeRecipe, SafeUser, ProfilePreferences } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import Container from '@/app/components/utils/Container';
import Tabs from '@/app/components/utils/Tabs';
import { OrderByType } from '@/app/utils/filter';
import ProfileRecipesContent from '@/app/components/profile/ProfileRecipesContent';
import ProfileBlogsContent from '@/app/components/profile/ProfileBlogsContent';
import UserStats from '@/app/components/stats/UserStats';
import ActivityHeatmap, {
    ActivityItem,
} from '@/app/components/profile/ActivityHeatmap';
import { getProfilePreferences } from '@/app/utils/profile-utils';
import { useProfileTabs } from '@/app/hooks/useProfileTabs';

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

type GraphRecipe = {
    id: string;
    createdAt: string;
    questId?: string | null;
};

const EMPTY_RECIPES: SafeRecipe[] = [];
const EMPTY_BLOGS: Blog[] = [];
const EMPTY_GRAPH_RECIPES: GraphRecipe[] = [];

const resolveTargetUser = (
    user?: SafeUser | null,
    profileUser?: SafeUser | null,
    currentUser?: SafeUser | null,
    profileUserId?: string
): SafeUser | null => {
    if (user) return user;
    if (profileUser) return profileUser;
    if (currentUser && currentUser.id === profileUserId) return currentUser;
    return null;
};

interface ProfileCookingStatsProps {
    show: boolean;
    user: SafeUser | null;
}

const ProfileCookingStats: React.FC<ProfileCookingStatsProps> = ({
    show,
    user,
}) => {
    if (!show || !user) return null;
    return (
        <div data-testid="profile-cooking-statistics">
            <UserStats user={user} />
        </div>
    );
};

interface ProfileActivitySectionProps {
    show: boolean;
    recipes?: Array<{
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

const ProfileActivitySection: React.FC<ProfileActivitySectionProps> = ({
    show,
    recipes = EMPTY_GRAPH_RECIPES,
    comments,
    challengeSubmissions,
    activities,
}) => {
    if (!show) return null;
    return (
        <div data-testid="profile-activity-graph">
            <ActivityHeatmap
                recipes={recipes}
                comments={comments}
                challengeSubmissions={challengeSubmissions}
                activities={activities}
            />
        </div>
    );
};

interface ProfileTabContentProps {
    activeTab: string;
    showArticles: boolean;
    recipes: SafeRecipe[];
    pinnedRecipes: SafeRecipe[];
    currentUser?: SafeUser | null;
    isOwnProfile: boolean;
    totalPages: number;
    currentPage: number;
    searchParams: SearchParams;
    blogs: Blog[];
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
    activeTab,
    showArticles,
    recipes,
    pinnedRecipes,
    currentUser,
    isOwnProfile,
    totalPages,
    currentPage,
    searchParams,
    blogs,
}) => {
    if (activeTab === 'recipes') {
        return (
            <ProfileRecipesContent
                recipes={recipes}
                pinnedRecipes={pinnedRecipes}
                currentUser={currentUser}
                isOwnProfile={isOwnProfile}
                totalPages={totalPages}
                currentPage={currentPage}
                searchParams={searchParams}
            />
        );
    }

    if (activeTab === 'blogs' && showArticles) {
        return (
            <ProfileBlogsContent
                blogs={blogs}
                searchParams={searchParams}
            />
        );
    }

    return null;
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
    const isOwnProfile = Boolean(
        currentUser && currentUser.id === profileUserId
    );
    const targetUser = resolveTargetUser(
        user,
        profileUser,
        currentUser,
        profileUserId
    );
    const preferences = profilePreferences || getProfilePreferences(targetUser);

    const showStats = preferences.showStats ?? true;
    const showActivityGraph = preferences.showActivityGraph ?? true;
    const showArticles = preferences.showArticles ?? true;

    const { activeTab, handleTabChange, tabs } = useProfileTabs({
        tabParam: searchParams?.tab,
        recipesCount: recipes.length + pinnedRecipes.length,
        blogsCount: blogs.length,
        showArticles,
    });

    return (
        <>
            <ProfileCookingStats
                show={showStats}
                user={targetUser}
            />

            <ProfileActivitySection
                show={showActivityGraph}
                recipes={graphRecipes}
                comments={comments}
                challengeSubmissions={challengeSubmissions}
                activities={activities}
            />

            <Container>
                <div className="mt-2 mb-8">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        data-testid="profile-tabs"
                    />
                </div>

                <ProfileTabContent
                    activeTab={activeTab}
                    showArticles={showArticles}
                    recipes={recipes}
                    pinnedRecipes={pinnedRecipes}
                    currentUser={currentUser}
                    isOwnProfile={isOwnProfile}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={searchParams}
                    blogs={blogs}
                />
            </Container>
        </>
    );
};

export default ProfileClient;
