'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import Pagination from '@/app/components/navigation/Pagination';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import { FcLike } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';
import { IFavoriteRecipesParams } from '@/app/actions/getFavoriteRecipes';

interface FavoritesClientProps {
    recipes: SafeRecipe[];
    currentUser?: SafeUser | null;
    totalPages: number;
    currentPage: number;
    searchParams: IFavoriteRecipesParams;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
    recipes,
    currentUser,
    totalPages,
    currentPage,
    searchParams,
}) => {
    const { t } = useTranslation();

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <FcLike size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                {t('favorites')}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('favorites_subtitle') ||
                                    'Todas tus recetas favoritas guardadas en un solo lugar.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <OrderByDropdown />
                    </div>
                </div>

                {/* Recipe Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {recipes.map((recipe: any) => (
                        <RecipeCard
                            currentUser={currentUser}
                            key={recipe.id}
                            data={recipe}
                        />
                    ))}
                </div>

                {/* Pagination */}
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={searchParams}
                />
            </div>
        </Container>
    );
};

export default FavoritesClient;
