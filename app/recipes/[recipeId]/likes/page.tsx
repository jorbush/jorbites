import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipeById from '@/app/actions/getRecipeById';
import getUsersWhoLikedRecipe from '@/app/actions/getUsersWhoLikedRecipe';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import LikesClient from './LikesClient';
import { Metadata } from 'next';

interface IParams {
    recipeId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const recipe = await getRecipeById(params);

    if (!recipe) {
        return {
            title: 'Receta no encontrada | Jorbites',
        };
    }

    return {
        title: `Likes - ${recipe.title} | Jorbites`,
        description: `Personas a las que les gusta ${recipe.title} en Jorbites`,
    };
}

const LikesPage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;

    const [recipe, currentUser, likedUsers] = await Promise.all([
        getRecipeById(params),
        getCurrentUser(),
        getUsersWhoLikedRecipe(params),
    ]);

    if (!recipe) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <LikesClient
                recipe={recipe}
                currentUser={currentUser}
                likedUsers={likedUsers}
            />
        </ClientOnly>
    );
};

export default LikesPage;
