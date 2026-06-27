'use client';

import axios from 'axios';
import { useCallback, useMemo, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useLoginModal from '@/app/hooks/useLoginModal';
import { SafeComment, SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { categories } from '@/app/components/navbar/categoriesData';
import { IconType } from 'react-icons';
import RecipeHead from '@/app/components/recipes/RecipeHead';
import RecipeInfo from '@/app/components/recipes/RecipeInfo';
import { preparationMethods } from '@/app/components/modals/recipe-steps/preparationMethodsData';
import Comments from '@/app/components/comments/Comments';
import DeleteRecipeButton from '@/app/components/recipes/DeleteRecipeButton';
import EditRecipeButton from '@/app/components/recipes/EditRecipeButton';
import { useTranslation } from 'react-i18next';
import { formatText } from '@/app/utils/textFormatting';
import RecipeSchema from '@/app/components/recipes/RecipeSchema';

interface RecipeClientProps {
    comments?: SafeComment[];
    recipe: SafeRecipe & {
        user: SafeUser;
        coCooksIds?: string[];
        linkedRecipeIds?: string[];
    };
    currentUser?: SafeUser | null;
}

const RecipeClient: React.FC<RecipeClientProps> = ({
    recipe,
    currentUser,
    comments,
}) => {
    const loginModal = useLoginModal();
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();

    const recipeCategories = useMemo(() => {
        return recipe.categories || [];
    }, [recipe]);

    const categoryObjects = useMemo(() => {
        return recipeCategories
            .map((cat: string) => categories.find((item) => item.label === cat))
            .filter(
                (
                    cat
                ): cat is {
                    icon: IconType;
                    label: string;
                    description: string;
                } => cat !== undefined
            );
    }, [recipeCategories]);

    const method = useMemo(() => {
        return preparationMethods.find((item) => item.label === recipe.method);
    }, [recipe.method]);

    const averageRating = recipe.averageRating || 0;
    const ratingCount = recipe.ratingCount || 0;

    const onCreateComment = useCallback(
        (comment: string, rating: number | null) => {
            if (!currentUser) {
                return loginModal.onOpen();
            }

            startTransition(async () => {
                try {
                    await axios.post('/api/comments', {
                        comment: comment,
                        recipeId: recipe?.id,
                        rating: rating,
                    });
                    toast.success(t('comment_created'));
                } catch {
                    toast.error(t('something_went_wrong'));
                } finally {
                    refresh();
                }
            });
        },
        [recipe?.id, refresh, currentUser, loginModal, t]
    );

    const formattedDescription = useMemo(() => {
        return formatText(recipe.description);
    }, [recipe.description]);

    const formattedIngredients = useMemo(() => {
        return recipe.ingredients.map((ingredient) => formatText(ingredient));
    }, [recipe.ingredients]);

    const formattedSteps = useMemo(() => {
        return recipe.steps.map((step) => formatText(step));
    }, [recipe.steps]);

    return (
        <Container>
            <RecipeSchema
                title={recipe.title}
                description={recipe.description}
                imageSrc={recipe.imageSrc}
                createdAt={recipe.createdAt}
                userName={recipe.user?.name}
                minutes={recipe.minutes}
                ingredients={recipe.ingredients}
                steps={recipe.steps}
                categories={recipeCategories}
                extraImages={recipe.extraImages}
                youtubeUrl={recipe.youtubeUrl}
                recipeId={recipe.id}
                averageRating={averageRating}
                ratingCount={ratingCount}
                comments={comments}
                calories={recipe.calories}
                recipeCuisine={recipe.recipeCuisine}
                recipeYield={recipe.recipeYield}
            />
            <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col gap-6">
                    <RecipeHead
                        title={recipe.title}
                        minutes={recipe.minutes.toString()}
                        imagesSrc={[recipe.imageSrc, ...recipe.extraImages]}
                    />
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-1 md:gap-10">
                        <RecipeInfo
                            id={recipe.id}
                            user={recipe.user}
                            likes={recipe.numLikes}
                            currentUser={currentUser}
                            categories={categoryObjects}
                            method={method}
                            description={formattedDescription}
                            descriptionText={recipe.description}
                            ingredients={formattedIngredients}
                            ingredientsText={recipe.ingredients}
                            steps={formattedSteps}
                            stepsText={recipe.steps}
                            coCooksIds={recipe.coCooksIds || []}
                            linkedRecipeIds={recipe.linkedRecipeIds || []}
                            youtubeUrl={recipe.youtubeUrl || undefined}
                            averageRating={averageRating}
                            ratingCount={ratingCount}
                        />
                    </div>
                    <div id="comments-section">
                        <Comments
                            currentUser={currentUser}
                            onCreateComment={onCreateComment}
                            comments={comments}
                            isLoading={isPending}
                        />
                    </div>
                    {currentUser?.id === recipe.userId && (
                        <>
                            <EditRecipeButton recipe={recipe} />
                            <DeleteRecipeButton id={recipe.id} />
                        </>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default RecipeClient;
