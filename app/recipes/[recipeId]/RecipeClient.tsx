'use client';

import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
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
    comments: initialComments = [],
}) => {
    const loginModal = useLoginModal();
    const { t } = useTranslation();
    const [comments, setComments] = useState<SafeComment[]>(initialComments);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const category = useMemo(() => {
        return categories.find((item) => item.label === recipe.category);
    }, [recipe.category]);

    const method = useMemo(() => {
        return preparationMethods.find((item) => item.label === recipe.method);
    }, [recipe.method]);

    const onCreateComment = useCallback(
        (commentText: string) => {
            if (!currentUser) {
                return loginModal.onOpen();
            }
            if (isSubmitting) return;
            setIsSubmitting(true);
            const tempId = `temp_${Date.now()}`;
            const optimisticComment: SafeComment = {
                id: tempId,
                comment: commentText,
                createdAt: new Date().toISOString(),
                userId: currentUser.id,
                recipeId: recipe.id,
                user: {
                    ...currentUser,
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                },
            };
            setComments((prev) => [...prev, optimisticComment]);
            axios
                .post('/api/comments', {
                    comment: commentText,
                    recipeId: recipe?.id,
                })
                .then((response) => {
                    toast.success(t('comment_created'));
                    if (response.data && response.data.comments) {
                        const newComments = response.data.comments;
                        const userComments = newComments.filter(
                            (comment: any) =>
                                comment.userId === currentUser.id &&
                                comment.comment === commentText
                        );
                        if (userComments.length > 0) {
                            const latestUserComment = userComments.reduce(
                                (latest: any, current: any) => {
                                    return new Date(current.createdAt) >
                                        new Date(latest.createdAt)
                                        ? current
                                        : latest;
                                },
                                userComments[0]
                            );

                            if (latestUserComment) {
                                const realComment = {
                                    ...latestUserComment,
                                    user: {
                                        id: currentUser.id,
                                        name: currentUser.name || '',
                                        email: currentUser.email || '',
                                        image: currentUser.image,
                                        level: currentUser.level || 0,
                                        verified: currentUser.verified || false,
                                        createdAt: currentUser.createdAt,
                                        updatedAt: currentUser.updatedAt,
                                    },
                                };
                                setComments((prev) =>
                                    prev.map((comment) =>
                                        comment.id === tempId
                                            ? realComment
                                            : comment
                                    )
                                );
                            }
                        }
                    }
                })
                .catch((error) => {
                    toast.error(t('something_went_wrong'));
                    console.error(error);
                    setComments((prev) => prev.filter((c) => c.id !== tempId));
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        },
        [recipe?.id, currentUser, loginModal, t, isSubmitting]
    );

    const onDeleteComment = useCallback((commentId: string) => {
        setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== commentId)
        );
    }, []);

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
                        onDeleteComment={onDeleteComment}
                        isSubmitting={isSubmitting}
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
