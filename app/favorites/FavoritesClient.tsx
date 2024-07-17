import { SafeRecipe, SafeUser } from '@/app/types';

import Heading from '@/app/components/Heading';
import Container from '@/app/components/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';

interface FavoritesClientProps {
    recipes: SafeRecipe[];
    currentUser?: SafeUser | null;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
    recipes,
    currentUser,
}) => {
    return (
        <Container>
            <Heading title="Favorites" />
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {recipes.map((recipe: any) => (
                    <RecipeCard
                        currentUser={currentUser}
                        key={recipe.id}
                        data={recipe}
                    />
                ))}
            </div>
        </Container>
    );
};

export default FavoritesClient;
