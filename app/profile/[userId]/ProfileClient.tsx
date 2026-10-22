'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeRecipe, SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import Container from '@/app/components/utils/Container';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { OrderByType } from '@/app/utils/filter';
import { FiBookOpen } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ProfileRecipesContent from '@/app/components/profile/ProfileRecipesContent';
import ProfileBlogsContent from '@/app/components/profile/ProfileBlogsContent';

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
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const isOwnProfile = Boolean(
        currentUser && currentUser.id === profileUserId
    );

    const [activeTab, setActiveTab] = useState<string>(() =>
        getInitialTab(
            searchParams?.tab,
            recipes.length + pinnedRecipes.length,
            blogs.length
        )
    );

    const handleTabChange = (tabId: string) => {
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
        {
            id: 'blogs',
            label: t('blogs') || 'Blogs',
            icon: <FiBookOpen size={18} />,
        },
    ];

    return (
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

            {activeTab === 'blogs' && (
                <ProfileBlogsContent
                    blogs={blogs}
                    searchParams={searchParams}
                />
            )}
        </Container>
    );
};

export default ProfileClient;
