'use client';

import axios from 'axios';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import useLoginModal from '@/app/hooks/useLoginModal';
import { SafeComment, SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/Container';
import { categories } from '@/app/components/navbar/Categories';
import RecipeHead from '@/app/components/recipes/RecipeHead';
import RecipeInfo from '@/app/components/recipes/RecipeInfo';
import { preparationMethods } from '@/app/components/modals/RecipeModal';
import Comments from '@/app/components/comments/Comments';
import DeleteRecipeButton from '@/app/components/recipes/DeleteRecipeButton';
import { useTranslation } from 'react-i18next';

interface RecipeClientProps {
    comments?: SafeComment[];
    recipe: SafeRecipe & {
        user: SafeUser;
    };
    currentUser?: SafeUser | null;
}

const RecipeClient: React.FC<RecipeClientProps> = ({
    recipe,
    currentUser,
    comments,
}) => {
    const loginModal = useLoginModal();
    const router = useRouter();
    const { t } = useTranslation();

    const category = useMemo(() => {
        return categories.find((item) => item.label === recipe.category);
    }, [recipe.category]);

    const method = useMemo(() => {
        return preparationMethods.find((item) => item.label === recipe.method);
    }, [recipe.method]);

    const onCreateComment = useCallback(
        (comment: string) => {
            if (!currentUser) {
                return loginModal.onOpen();
            }
            axios
                .post('/api/comments', {
                    comment: comment,
                    recipeId: recipe?.id,
                })
                .then(() => {
                    toast.success(t('comment_created'));
                })
                .catch(() => {
                    toast.error(t('something_went_wrong'));
                })
                .finally(() => {
                    router.refresh();
                });
        },
        [recipe?.id, router, currentUser, loginModal, t]
    );

    return (
        <Container>
            <div className="mx-auto max-w-screen-lg">
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
                            category={category}
                            method={method}
                            description={recipe.description}
                            ingredients={recipe.ingredients}
                            steps={recipe.steps}
                        />
                    </div>
                    <Comments
                        currentUser={currentUser}
                        onCreateComment={onCreateComment}
                        comments={comments}
                    />
                    {currentUser?.id === recipe.userId && (
                        <DeleteRecipeButton id={recipe.id} />
                    )}
                </div>
            </div>
        </Container>
    );
};

export default RecipeClient;
