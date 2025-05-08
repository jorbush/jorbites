import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
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
    const [isLoading, setIsLoading] = useState(false);
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(recipeId);
    }, [currentUser, recipeId]);

    const toggleFavorite = useCallback(
        async (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (isLoading) {
                return;
            }

            if (!currentUser) {
                return loginModal.onOpen();
            }

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
        },
        [currentUser, hasFavorited, recipeId, loginModal, router, isLoading, t]
    );

    return {
        hasFavorited,
        toggleFavorite,
    };
};

export default useFavorite;
