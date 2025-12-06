'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import Pagination from '@/app/components/navigation/Pagination';
import { OrderByType } from '@/app/utils/filter';

interface SearchParams {
    orderBy?: OrderByType;
    page?: string;
}

interface ProfileClientProps {
    recipes: SafeRecipe[];
    currentUser?: SafeUser | null;
    totalPages: number;
    currentPage: number;
    searchParams: SearchParams;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
    recipes,
    currentUser,
    totalPages,
    currentPage,
    searchParams,
}) => {
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
            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={searchParams}
                />
            )}
        </Container>
    );
};

export default ProfileClient;
