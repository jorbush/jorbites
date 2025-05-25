import { SafeRecipe, SafeUser } from '@/app/types';
import Heading from '@/app/components/navigation/Heading';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import { FcLike } from 'react-icons/fc';

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
            <div className="mb-10 text-center">
                <h1 className="mb-3 flex items-center justify-center text-3xl font-bold sm:text-4xl dark:text-neutral-100">
                    <FcLike className="mr-2 text-3xl sm:text-4xl" />
                    Favorites
                </h1>
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
        </Container>
    );
};

export default FavoritesClient;
