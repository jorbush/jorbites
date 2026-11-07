import { Metadata } from 'next';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipeById from '@/app/actions/getRecipeById';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import RecipeClient from '@/app/recipes/[recipeId]/RecipeClient';
import RecipeDetailSkeleton from '@/app/components/recipes/RecipeDetailSkeleton';
import getCommentsByRecipeId from '@/app/actions/getCommentsByRecipeId';
import getCooksnapsByRecipeId from '@/app/actions/getCooksnapsByRecipeId';
import getRecipeRemixes from '@/app/actions/getRecipeRemixes';
import { trackRecipeView } from '@/app/actions/tracking';
import { createOGImageUrl } from '@/app/utils/seo-utils';

interface IParams {
    recipeId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;

    let recipe;
    try {
        recipe = await getRecipeById(params);
    } catch {
        return {
            title: 'Receta no encontrada | Jorbites',
        };
    }

    if (!recipe) {
        return {
            title: 'Receta no encontrada | Jorbites',
        };
    }

    const ogImageUrl = createOGImageUrl(recipe.imageSrc);
    return {
        title: `${recipe.title} | Jorbites`,
        description:
            recipe.description?.substring(0, 160) ||
            'Receta compartida en Jorbites',
        openGraph: {
            title: `${recipe.title} | Jorbites`,
            description:
                recipe.description?.substring(0, 160) ||
                'Receta compartida en Jorbites',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: recipe.title,
                },
            ],
            type: 'article',
        },
        alternates: {
            canonical: `/recipes/${params.recipeId}`,
        },
    };
}

const RecipePage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;

    let recipe, currentUser, comments, cooksnaps, remixes;
    try {
        [recipe, currentUser, comments, cooksnaps, remixes] = await Promise.all(
            [
                getRecipeById(params),
                getCurrentUser(),
                getCommentsByRecipeId(params),
                getCooksnapsByRecipeId(params),
                getRecipeRemixes(params),
            ]
        );
    } catch {
        return (
            <ClientOnly>
                <EmptyState
                    title="Recipe not found"
                    subtitle="Sorry, we couldn't find this recipe. It may have been removed or the link might be incorrect."
                />
            </ClientOnly>
        );
    }

    if (!recipe) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Recipe not found"
                    subtitle="Sorry, we couldn't find this recipe. It may have been removed or the link might be incorrect."
                />
            </ClientOnly>
        );
    }

    if (recipe?.id && currentUser?.id) {
        void trackRecipeView(recipe.id, currentUser.id);
    }

    return (
        <ClientOnly fallback={<RecipeDetailSkeleton />}>
            <RecipeClient
                recipe={recipe}
                currentUser={currentUser}
                comments={comments}
                cooksnaps={cooksnaps}
                remixes={remixes}
            />
        </ClientOnly>
    );
};

export default RecipePage;
