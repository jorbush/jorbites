'use client';

import { useState } from 'react';
import { SafeRecipe, SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import BlogCard from '@/app/components/blog/BlogCard';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import Pagination from '@/app/components/navigation/Pagination';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import EmptyState from '@/app/components/utils/EmptyState';
import { OrderByType } from '@/app/utils/filter';
import { BsPinAngleFill } from 'react-icons/bs';
import { FiBookOpen } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

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

const ProfileClient: React.FC<ProfileClientProps> = ({
    recipes,
    pinnedRecipes = EMPTY_RECIPES,
    currentUser,
    totalPages,
    currentPage,
    totalRecipes,
    searchParams,
    profileUserId,
    blogs = EMPTY_BLOGS,
}) => {
    const { t } = useTranslation();
    const isOwnProfile = currentUser && currentUser.id === profileUserId;

    const initialTab =
        searchParams?.tab === 'articles' ? 'articles' : 'recipes';
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    const recipeCount =
        totalRecipes !== undefined ? totalRecipes : recipes.length;

    const tabs: Tab[] = [
        {
            id: 'recipes',
            label: `${t('recipes', 'Recipes')} (${recipeCount})`,
            icon: <MdRestaurantMenu size={20} />,
        },
        {
            id: 'articles',
            label: `${t('stories_and_articles', 'Stories & Articles')} (${blogs.length})`,
            icon: <FiBookOpen size={18} />,
        },
    ];

    return (
        <Container>
            <div className="mb-6">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    data-testid="profile-tabs"
                />
            </div>

            {activeTab === 'recipes' && (
                <div>
                    {pinnedRecipes.length > 0 && (
                        <div className="mb-8 w-full">
                            <div className="mb-4 flex items-center gap-2">
                                <BsPinAngleFill
                                    className="text-green-450"
                                    size={22}
                                />
                                <h2 className="text-xl font-semibold dark:text-neutral-100">
                                    {t('pinned_recipes')}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                {pinnedRecipes.map((recipe: any) => (
                                    <RecipeCard
                                        currentUser={currentUser}
                                        key={`pinned-${recipe.id}`}
                                        data={recipe}
                                        canPin={
                                            !!(
                                                isOwnProfile &&
                                                currentUser?.id ===
                                                    recipe.userId
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <hr className="mt-8 border-neutral-200 dark:border-neutral-800" />
                        </div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <OrderByDropdown />
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {recipes.map((recipe: any) => (
                            <RecipeCard
                                currentUser={currentUser}
                                key={recipe.id}
                                data={recipe}
                                canPin={
                                    !!(
                                        isOwnProfile &&
                                        currentUser?.id === recipe.userId
                                    )
                                }
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            searchParams={searchParams}
                        />
                    )}
                </div>
            )}

            {activeTab === 'articles' && (
                <div
                    className="pt-2"
                    data-testid="profile-articles-content"
                >
                    {blogs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-8">
                            <EmptyState
                                title={
                                    t('no_articles_found') ||
                                    'No articles found'
                                }
                                subtitle={
                                    t('no_articles_subtitle') ||
                                    'This user has not published any articles yet.'
                                }
                            />
                        </div>
                    )}
                </div>
            )}
        </Container>
    );
};

export default ProfileClient;
