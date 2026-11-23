'use client';

import React from 'react';
import {
    ProfileLoadedCollections,
    ProfilePreferences,
    SafeList,
    SafeListPreview,
    SafePlanning,
    SafePlanningPreview,
    SafeQuest,
    SafeQuestPreview,
    SafeRecipe,
    SafeUser,
} from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import Container from '@/app/components/utils/Container';
import TabNavigation from '@/app/components/utils/TabNavigation';
import { OrderByType } from '@/app/utils/filter';
import ProfileRecipesContent from '@/app/components/profile/ProfileRecipesContent';
import ProfileBlogsContent from '@/app/components/profile/ProfileBlogsContent';
import ProfileListsContent from '@/app/components/profile/ProfileListsContent';
import ProfileQuestsContent from '@/app/components/profile/ProfileQuestsContent';
import ProfilePlanningsContent from '@/app/components/profile/ProfilePlanningsContent';
import ProfileCollectionSkeleton from '@/app/components/profile/ProfileCollectionSkeleton';
import UserStats from '@/app/components/stats/UserStats';
import ActivityHeatmap, {
    ActivityItem,
} from '@/app/components/profile/ActivityHeatmap';
import { getProfilePreferences } from '@/app/utils/profile-utils';
import { useProfileTabs } from '@/app/hooks/useProfileTabs';
import useUrlSearch from '@/app/hooks/useUrlSearch';

interface SearchParams {
    orderBy?: OrderByType;
    page?: string;
    tab?: string;
    search?: string;
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
    lists?: Array<SafeList | SafeListPreview>;
    quests?: Array<SafeQuest | SafeQuestPreview>;
    plannings?: Array<SafePlanning | SafePlanningPreview>;
    loadedCollections?: ProfileLoadedCollections;
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
const EMPTY_LISTS: Array<SafeList | SafeListPreview> = [];
const EMPTY_QUESTS: Array<SafeQuest | SafeQuestPreview> = [];
const EMPTY_PLANNINGS: Array<SafePlanning | SafePlanningPreview> = [];
const EMPTY_GRAPH_RECIPES: GraphRecipe[] = [];
const DEFAULT_LOADED_COLLECTIONS: ProfileLoadedCollections = {
    lists: true,
    quests: true,
    plannings: true,
};

const isCollectionTabWaiting = (
    activeTab: string,
    preferences: Required<ProfilePreferences>,
    loadedCollections: ProfileLoadedCollections
): boolean => {
    if (activeTab === 'lists' && preferences.showLists) {
        return !loadedCollections.lists;
    }
    if (activeTab === 'quests' && preferences.showQuests) {
        return !loadedCollections.quests;
    }
    if (activeTab === 'plannings' && preferences.showPlannings) {
        return !loadedCollections.plannings;
    }
    return false;
};

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
    preferences: Required<ProfilePreferences>;
    loadedCollections: ProfileLoadedCollections;
    recipes: SafeRecipe[];
    pinnedRecipes: SafeRecipe[];
    currentUser?: SafeUser | null;
    isOwnProfile: boolean;
    totalPages: number;
    currentPage: number;
    searchParams: SearchParams;
    blogs: Blog[];
    lists: Array<SafeList | SafeListPreview>;
    quests: Array<SafeQuest | SafeQuestPreview>;
    plannings: Array<SafePlanning | SafePlanningPreview>;
    searchQuery: string;
    isSearching: boolean;
    onSearchChange: (query: string) => void;
    onSearchSubmit: () => void;
    onClearSearch: () => void;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
    activeTab,
    preferences,
    loadedCollections,
    recipes,
    pinnedRecipes,
    currentUser,
    isOwnProfile,
    totalPages,
    currentPage,
    searchParams,
    blogs,
    lists,
    quests,
    plannings,
    searchQuery,
    isSearching,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
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
                searchQuery={searchQuery}
                isSearching={isSearching}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onClearSearch={onClearSearch}
            />
        );
    }

    if (activeTab === 'blogs' && preferences.showArticles) {
        return (
            <ProfileBlogsContent
                blogs={blogs}
                searchParams={searchParams}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onClearSearch={onClearSearch}
            />
        );
    }

    if (isCollectionTabWaiting(activeTab, preferences, loadedCollections)) {
        return <ProfileCollectionSkeleton />;
    }

    if (activeTab === 'lists' && preferences.showLists) {
        return (
            <ProfileListsContent
                lists={lists}
                isOwnProfile={isOwnProfile}
                searchParams={searchParams}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onClearSearch={onClearSearch}
            />
        );
    }

    if (activeTab === 'quests' && preferences.showQuests) {
        return (
            <ProfileQuestsContent
                quests={quests}
                searchParams={searchParams}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onClearSearch={onClearSearch}
            />
        );
    }

    if (activeTab === 'plannings' && preferences.showPlannings) {
        return (
            <ProfilePlanningsContent
                plannings={plannings}
                currentUser={currentUser}
                isOwnProfile={isOwnProfile}
                searchParams={searchParams}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onClearSearch={onClearSearch}
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
    lists = EMPTY_LISTS,
    quests = EMPTY_QUESTS,
    plannings = EMPTY_PLANNINGS,
    loadedCollections = DEFAULT_LOADED_COLLECTIONS,
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
    const resolvedPreferences = getProfilePreferences(
        profilePreferences ? ({ profilePreferences } as SafeUser) : targetUser
    );

    const {
        searchQuery,
        setSearchQuery,
        submitSearch,
        clearSearch,
        isSearching,
    } = useUrlSearch({
        basePath: `/profile/${profileUserId}`,
        initialSearch: searchParams?.search ?? '',
    });

    const { activeTab, handleTabChange, tabs } = useProfileTabs({
        tabParam: searchParams?.tab,
        recipesCount: recipes.length + pinnedRecipes.length,
        blogsCount: blogs.length,
        listsCount: lists.length,
        questsCount: quests.length,
        planningsCount: plannings.length,
        showArticles: resolvedPreferences.showArticles,
        showLists: resolvedPreferences.showLists,
        showQuests: resolvedPreferences.showQuests,
        showPlannings: resolvedPreferences.showPlannings,
        isSearching,
    });

    return (
        <>
            <ProfileCookingStats
                show={resolvedPreferences.showStats}
                user={targetUser}
            />

            <ProfileActivitySection
                show={resolvedPreferences.showActivityGraph}
                recipes={graphRecipes}
                comments={comments}
                challengeSubmissions={challengeSubmissions}
                activities={activities}
            />

            <Container>
                {tabs.length > 1 && (
                    <div className="mt-2 mb-6">
                        <TabNavigation
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            data-testid="profile-tabs"
                        />
                    </div>
                )}

                <ProfileTabContent
                    activeTab={activeTab}
                    preferences={resolvedPreferences}
                    loadedCollections={loadedCollections}
                    recipes={recipes}
                    pinnedRecipes={pinnedRecipes}
                    currentUser={currentUser}
                    isOwnProfile={isOwnProfile}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={searchParams}
                    blogs={blogs}
                    lists={lists}
                    quests={quests}
                    plannings={plannings}
                    searchQuery={searchQuery}
                    isSearching={isSearching}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={submitSearch}
                    onClearSearch={clearSearch}
                />
            </Container>
        </>
    );
};

export default ProfileClient;
