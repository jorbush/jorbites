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
    };
    blogs: Blog[];
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
}) => {
    const hasClientContent = recipes.length > 0 || blogs.length > 0;

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
                />
            </ClientOnly>
        </Suspense>
    );
};

export default ProfileContentSection;
