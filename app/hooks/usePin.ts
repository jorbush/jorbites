import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

interface IUsePin {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const usePin = ({ recipeId, currentUser }: IUsePin) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const isPinned = useMemo(() => {
        const list = currentUser?.pinnedRecipeIds || [];
        return list.includes(recipeId);
    }, [currentUser, recipeId]);

    const togglePin = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
            e.stopPropagation();

            if (isLoading) {
                return;
            }

            if (!currentUser) {
                return loginModal.onOpen();
            }

            setIsLoading(true);

            try {
                if (isPinned) {
                    await axios.delete(`/api/pinned/${recipeId}`);
                    toast.success(t('unpin_success'));
                } else {
                    const currentPinned = currentUser.pinnedRecipeIds || [];
                    if (currentPinned.length >= 4) {
                        toast.error(t('pin_limit_reached'));
                        setIsLoading(false);
                        return;
                    }
                    await axios.post(`/api/pinned/${recipeId}`);
                    toast.success(t('pin_success'));
                }

                router.refresh();
            } catch (error: any) {
                const message =
                    error.response?.data?.error ||
                    error.message ||
                    t('something_went_wrong');
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, isPinned, recipeId, loginModal, router, isLoading, t]
    );

    return {
        isPinned,
        togglePin,
        isLoading,
    };
};

export default usePin;
