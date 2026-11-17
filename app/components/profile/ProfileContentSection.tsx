import React, { Suspense } from 'react';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import ProfileClientSkeleton from '@/app/components/profile/ProfileClientSkeleton';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import { SafeRecipe, SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import { OrderByType } from '@/app/utils/filter';

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
    user,
    graphRecipes,
    comments,
    challengeSubmissions,
}) => {
    const hasSearchQuery = Boolean(searchParams?.search?.trim());
    const hasClientContent =
        recipes.length > 0 ||
        pinnedRecipes.length > 0 ||
        blogs.length > 0 ||
        hasSearchQuery ||
        Boolean(user?.recipeCount && user.recipeCount > 0) ||
        Boolean(graphRecipes && graphRecipes.length > 0) ||
        Boolean(comments && comments.length > 0) ||
        Boolean(challengeSubmissions && challengeSubmissions.length > 0);

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
