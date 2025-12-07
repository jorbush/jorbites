'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import Pagination from '@/app/components/navigation/Pagination';
import { FcLike } from 'react-icons/fc';
import SectionHeader from '@/app/components/utils/SectionHeader';
import { useTranslation } from 'react-i18next';
import { IFavoriteRecipesParams } from '@/app/actions/getFavoriteRecipes';
import OrderByDropdown from '../components/navbar/OrderByDropdown';

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
            <div className="flex items-center justify-between">
                <SectionHeader
                    icon={FcLike}
                    title={t('favorites')}
                />
                <OrderByDropdown />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {recipes.map((recipe: any) => (
                    <RecipeCard
                        currentUser={currentUser}
                        key={recipe.id}
                        data={recipe}
                    />
                ))}
            </div>
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                searchParams={searchParams}
            />
        </Container>
    );
};

export default FavoritesClient;
