'use client';

import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import { OrderByType } from '@/app/utils/filter';

const RECIPES_PER_PAGE = 12;

interface ProfileClientProps {
    initialRecipes: SafeRecipe[];
    recipesCount: number;
    currentUser?: SafeUser | null;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
    initialRecipes,
    recipesCount,
    currentUser,
}) => {
    const [recipes, setRecipes] = useState<SafeRecipe[]>(initialRecipes);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { ref, inView } = useInView();

    const params = useParams();
    const searchParams = useSearchParams();
    const orderBy = (searchParams.get('orderBy') as OrderByType) || undefined;

    const loadMoreRecipes = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        const nextPage = page + 1;
        const { data } = await axios.get(
            `/api/recipes/user/${params.userId}`,
            {
                params: {
                    page: nextPage,
                    limit: RECIPES_PER_PAGE,
                    orderBy,
                },
            },
        );
        setRecipes((prev) => [...prev, ...data]);
        setPage(nextPage);
        setIsLoading(false);
    }, [isLoading, page, orderBy, params.userId]);

    useEffect(() => {
        if (inView && recipes.length < recipesCount) {
            loadMoreRecipes();
        }
    }, [inView, recipes.length, recipesCount, loadMoreRecipes]);

    useEffect(() => {
        setRecipes(initialRecipes);
        setPage(1);
    }, [initialRecipes, orderBy]);

    return (
        <Container>
            <div className="mb-4 flex justify-end">
                <OrderByDropdown />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {recipes.map((recipe: any) => (
                    <RecipeCard
                        currentUser={currentUser}
                        key={recipe.id}
                        data={recipe}
                    />
                ))}
            </div>
            {recipes.length < recipesCount && (
                <div ref={ref} className="mt-8">
                    Loading...
                </div>
            )}
        </Container>
    );
};

export default ProfileClient;
