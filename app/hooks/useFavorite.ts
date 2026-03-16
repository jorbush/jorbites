import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useOptimistic, useTransition } from 'react';
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
    const loginModal = useLoginModal();
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(recipeId);
    }, [currentUser, recipeId]);

    const [optimisticValues, addOptimisticValues] = useOptimistic(
        { hasFavorited, likesCount: likes },
        (state, newHasFavorited: boolean) => ({
            hasFavorited: newHasFavorited,
            likesCount: newHasFavorited
                ? state.likesCount + 1
                : Math.max(0, state.likesCount - 1),
        })
    );

    const toggleFavorite = useCallback(
        async (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (!currentUser) {
                return loginModal.onOpen();
            }

            startTransition(async () => {
                const nextHasFavorited = !hasFavorited;
                addOptimisticValues(nextHasFavorited);

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
                }
            });
        },
        [
            currentUser,
            hasFavorited,
            recipeId,
            loginModal,
            router,
            t,
            addOptimisticValues,
        ]
    );

    return {
        hasFavorited: optimisticValues.hasFavorited,
        likesCount: optimisticValues.likesCount,
        toggleFavorite,
        isLoading: isPending,
    };
};

export default useFavorite;
