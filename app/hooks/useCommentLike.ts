import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

interface IUseCommentLike {
    commentId: string;
    likedIds: string[];
    currentUser?: SafeUser | null;
}

const useCommentLike = ({
    commentId,
    likedIds = [],
    currentUser,
}: IUseCommentLike) => {
    const { refresh } = useRouter() || {};
    const [isLoading, setIsLoading] = useState(false);
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const hasLiked = useMemo(() => {
        return likedIds.includes(currentUser?.id || '');
    }, [currentUser, likedIds]);

    const toggleLike = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
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

                if (hasLiked) {
                    request = () =>
                        axios.delete(`/api/comments/${commentId}/like`);
                } else {
                    request = () =>
                        axios.post(`/api/comments/${commentId}/like`);
                }

                await request();
                refresh();
                toast.success(t('success'));
            } catch (error) {
                toast.error((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        },
        [currentUser, hasLiked, commentId, loginModal, refresh, isLoading, t]
    );

    return {
        hasLiked,
        toggleLike,
    };
};

export default useCommentLike;
