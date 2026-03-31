import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    useCallback,
    useOptimistic,
    useRef,
    startTransition,
} from 'react';
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

    const isRequestInFlight = useRef(false);

    const toggleFavorite = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (isRequestInFlight.current) {
                return;
            }

            if (!currentUser) {
                return loginModal.onOpen();
            }

            const currentFavorited = optimisticFavorited;

            isRequestInFlight.current = true;

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
                    setOptimisticFavorited(currentFavorited);
                    toast.error((error as Error).message);
                } finally {
                    isRequestInFlight.current = false;
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
        ]
    );

    return {
        hasFavorited: optimisticFavorited,
        toggleFavorite,
    };
};

export default useFavorite;
