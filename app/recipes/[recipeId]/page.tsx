import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipeById from '@/app/actions/getRecipeById';

import ClientOnly from '@/app/components/ClientOnly';
import EmptyState from '@/app/components/EmptyState';
import RecipeClient from '@/app/recipes/[recipeId]/RecipeClient';
import getCommentsByRecipeId from '@/app/actions/getCommentsByRecipeId';

interface IParams {
    recipeId?: string;
}

const RecipePage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const recipe = await getRecipeById(params);
    const currentUser = await getCurrentUser();
    const comments = await getCommentsByRecipeId(params) || [];

    if (!recipe) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <RecipeClient
                recipe={recipe}
                currentUser={currentUser}
                comments={comments}
            />
        </ClientOnly>
    );
};

export default RecipePage;
