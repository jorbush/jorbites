import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, useOptimistic, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

interface IUseFavorite {
    recipeId: string;
    currentUser?: SafeUser | null;
    likes?: number;
}

const useFavorite = ({ recipeId, currentUser, likes = 0 }: IUseFavorite) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(recipeId);
    }, [currentUser, recipeId]);

    const [optimisticState, addOptimisticUpdate] = useOptimistic(
        { hasFavorited, likes },
        (state, newState: { hasFavorited: boolean; likes: number }) => newState
    );

    const toggleFavorite = useCallback(
        async (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (isLoading || isPending) {
                return;
            }

            if (!currentUser) {
                return loginModal.onOpen();
            }

            const newHasFavorited = !hasFavorited;
            const newLikes = newHasFavorited
                ? likes + 1
                : Math.max(0, likes - 1);

            startTransition(async () => {
                addOptimisticUpdate({
                    hasFavorited: newHasFavorited,
                    likes: newLikes,
                });

                setIsLoading(true);

                try {
                    let request;
                    let requestLike;

                    if (hasFavorited) {
                        request = () => axios.delete(`/api/favorites/${recipeId}`);
                        requestLike = () =>
                            axios.post(`/api/recipe/${recipeId}`, {
                                operation: 'decrement',
                            });
                    } else {
                        request = () => axios.post(`/api/favorites/${recipeId}`);
                        requestLike = () =>
                            axios.post(`/api/recipe/${recipeId}`, {
                                operation: 'increment',
                            });
                    }

                    await requestLike();
                    await request();
                    router.refresh();
                    toast.success(t('success'));
                } catch (error) {
                    toast.error((error as Error).message);
                } finally {
                    setIsLoading(false);
                }
            });
        },
        [currentUser, hasFavorited, recipeId, loginModal, router, isLoading, isPending, t, likes, addOptimisticUpdate]
    );

    return {
        hasFavorited: optimisticState.hasFavorited,
        optimisticLikes: optimisticState.likes,
        toggleFavorite,
    };
};

export default useFavorite;
