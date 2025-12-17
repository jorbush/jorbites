import { Metadata } from 'next';
import { Suspense } from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipeById from '@/app/actions/getRecipeById';
import EmptyState from '@/app/components/utils/EmptyState';
import RecipeClient from '@/app/recipes/[recipeId]/RecipeClient';
import getCommentsByRecipeId from '@/app/actions/getCommentsByRecipeId';
import RecipeClientSkeleton from '@/app/components/recipes/RecipeClientSkeleton';

interface IParams {
    recipeId?: string;
}

function createOGImageUrl(cloudinaryUrl: string | null): string {
    if (!cloudinaryUrl) return '/jorbites-social.jpg';

    if (!cloudinaryUrl.includes('cloudinary.com')) {
        return cloudinaryUrl;
    }

    try {
        const cloudinaryRegex =
            /^(https?:\/\/res\.cloudinary\.com\/[^/]+)\/image\/upload(?:\/([^/]+))?\/(.+)$/;
        const matches = cloudinaryUrl.match(cloudinaryRegex);

        if (matches) {
            const [, baseUrl, _existingTransforms, imagePath] = matches;
            return `${baseUrl}/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/${imagePath}`;
        } else {
            return cloudinaryUrl;
        }
    } catch (error) {
        console.error('Error creating OG image URL:', error);
        return cloudinaryUrl;
    }
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
    };
}

const RecipePage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const recipe = await getRecipeById(params);
    const currentUser = await getCurrentUser();
    const comments = await getCommentsByRecipeId(params);

    if (!recipe) {
        return (
            <Suspense fallback={<div className="min-h-[60vh]" />}>
                <EmptyState />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<RecipeClientSkeleton />}>
            <RecipeClient
                recipe={recipe}
                currentUser={currentUser}
                comments={comments}
            />
        </Suspense>
    );
};

export default RecipePage;
