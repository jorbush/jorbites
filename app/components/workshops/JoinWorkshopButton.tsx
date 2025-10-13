'use client';

import { SafeUser } from '@/app/types';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useLoginModal from '@/app/hooks/useLoginModal';

interface JoinWorkshopButtonProps {
    workshopId: string;
    currentUser?: SafeUser | null;
    isParticipant: boolean;
    isPast: boolean;
    isHost: boolean;
}

const JoinWorkshopButton: React.FC<JoinWorkshopButtonProps> = ({
    workshopId,
    currentUser,
    isParticipant,
    isPast,
    isHost,
}) => {
    const router = useRouter();
    const loginModal = useLoginModal();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleClick = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            if (!currentUser) {
                return loginModal.onOpen();
            }

            if (isPast) {
                toast.error(t('workshop_date_passed'));
                return;
            }

            if (isHost) {
                return;
            }

            setLoading(true);

            try {
                const action = isParticipant ? 'leave' : 'join';
                await axios.post(`/api/workshop/${workshopId}/join`, {
                    action,
                });

                toast.success(
                    isParticipant ? t('workshop_left') : t('workshop_joined')
                );
                router.refresh();
            } catch (error: any) {
                toast.error(
                    error?.response?.data?.error || t('something_went_wrong')
                );
            } finally {
                setLoading(false);
            }
        },
        [
            currentUser,
            workshopId,
            isParticipant,
            isPast,
            isHost,
            router,
            loginModal,
            t,
        ]
    );

    if (isHost) {
        return (
            <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white"
            >
                {t('host')}
            </button>
        );
    }

    if (isPast) {
        return (
            <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white"
            >
                {t('workshop_date_passed')}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition ${
                isParticipant
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-600 hover:bg-green-700'
            } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            {loading
                ? '...'
                : isParticipant
                  ? t('leave_workshop')
                  : t('join_workshop')}
        </button>
    );
};

export default JoinWorkshopButton;
