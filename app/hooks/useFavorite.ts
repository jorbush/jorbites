import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useOptimistic, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

interface IUseFavorite {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const useFavorite = ({ recipeId, currentUser }: IUseFavorite) => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const hasFavorited = (currentUser?.favoriteIds || []).includes(recipeId);

    const [optimisticFavorited, setOptimisticFavorited] =
        useOptimistic(hasFavorited);

    const [isPending, startTransition] = useTransition();

    const toggleFavorite = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (isPending) {
                return;
            }

            if (!currentUser) {
                return loginModal.onOpen();
            }

            const currentFavorited = optimisticFavorited;

            startTransition(async () => {
                setOptimisticFavorited(!currentFavorited);

                try {
                    if (currentFavorited) {
                        await axios.post(`/api/recipe/${recipeId}`, {
                            operation: 'decrement',
                        });
                        await axios.delete(`/api/favorites/${recipeId}`);
                    } else {
                        await axios.post(`/api/recipe/${recipeId}`, {
                            operation: 'increment',
                        });
                        await axios.post(`/api/favorites/${recipeId}`);
                    }
                    router.refresh();
                    toast.success(t('success'));
                } catch (error) {
                    router.refresh();
                    toast.error((error as Error).message);
                }
            });
        },
        [
            currentUser,
            optimisticFavorited,
            recipeId,
            loginModal,
            router,
            t,
            setOptimisticFavorited,
            isPending,
        ]
    );

    return {
        hasFavorited: optimisticFavorited,
        toggleFavorite,
    };
};

export default useFavorite;
