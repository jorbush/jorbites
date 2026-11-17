import React, { Suspense } from 'react';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import ProfileClientSkeleton from '@/app/components/profile/ProfileClientSkeleton';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import {
    SafeList,
    SafePlanning,
    SafeQuest,
    SafeRecipe,
    SafeUser,
} from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import { OrderByType } from '@/app/utils/filter';

const EMPTY_LISTS: SafeList[] = [];
const EMPTY_QUESTS: SafeQuest[] = [];
const EMPTY_PLANNINGS: SafePlanning[] = [];

interface ProfileContentSectionProps {
    userId: string;
    tab?: string;
    recipes: SafeRecipe[];
    pinnedRecipes: SafeRecipe[];
    currentUser?: SafeUser | null;
    totalPages: number;
    currentPage: number;
    totalRecipes: number;
    searchParams: {
        orderBy?: OrderByType;
        page?: string;
        tab?: string;
        search?: string;
    };
    blogs: Blog[];
    lists?: SafeList[];
    quests?: SafeQuest[];
    plannings?: SafePlanning[];
    user?: SafeUser | null;
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
}

const hasProfileClientContent = ({
    recipes,
    pinnedRecipes,
    blogs,
    lists,
    quests,
    plannings,
    searchParams,
    user,
    graphRecipes,
    comments,
    challengeSubmissions,
}: {
    recipes: SafeRecipe[];
    pinnedRecipes: SafeRecipe[];
    blogs: Blog[];
    lists: SafeList[];
    quests: SafeQuest[];
    plannings: SafePlanning[];
    searchParams: ProfileContentSectionProps['searchParams'];
    user?: SafeUser | null;
    graphRecipes?: ProfileContentSectionProps['graphRecipes'];
    comments?: ProfileContentSectionProps['comments'];
    challengeSubmissions?: ProfileContentSectionProps['challengeSubmissions'];
}): boolean => {
    if (
        recipes.length > 0 ||
        pinnedRecipes.length > 0 ||
        blogs.length > 0 ||
        lists.length > 0 ||
        quests.length > 0 ||
        plannings.length > 0
    ) {
        return true;
    }

    if (searchParams?.search?.trim()) {
        return true;
    }

    return (
        Boolean(user?.recipeCount && user.recipeCount > 0) ||
        Boolean(graphRecipes && graphRecipes.length > 0) ||
        Boolean(comments && comments.length > 0) ||
        Boolean(challengeSubmissions && challengeSubmissions.length > 0)
    );
};

const ProfileContentSection: React.FC<ProfileContentSectionProps> = ({
    userId,
    tab = 'default',
    recipes,
    pinnedRecipes,
    currentUser,
    totalPages,
    currentPage,
    totalRecipes,
    searchParams,
    blogs,
    lists = EMPTY_LISTS,
    quests = EMPTY_QUESTS,
    plannings = EMPTY_PLANNINGS,
    user,
    graphRecipes,
    comments,
    challengeSubmissions,
}) => {
    const hasClientContent = hasProfileClientContent({
        recipes,
        pinnedRecipes,
        blogs,
        lists,
        quests,
        plannings,
        searchParams,
        user,
        graphRecipes,
        comments,
        challengeSubmissions,
    });

    if (!hasClientContent) {
        return (
            <ClientOnly>
                <EmptyState
                    title="No recipes found"
                    subtitle="Looks like this user has not created recipes."
                />
            </ClientOnly>
        );
    }

    return (
        <Suspense fallback={<ProfileClientSkeleton />}>
            <ClientOnly fallback={<ProfileClientSkeleton />}>
                <ProfileClient
                    key={`${userId}-${tab}`}
                    recipes={recipes}
                    pinnedRecipes={pinnedRecipes}
                    currentUser={currentUser}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalRecipes={totalRecipes}
                    searchParams={searchParams}
                    profileUserId={userId}
                    blogs={blogs}
                    lists={lists}
                    quests={quests}
                    plannings={plannings}
                    user={user}
                    graphRecipes={graphRecipes}
                    comments={comments}
                    challengeSubmissions={challengeSubmissions}
                />
            </ClientOnly>
        </Suspense>
    );
};

export default ProfileContentSection;
