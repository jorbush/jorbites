'use client';

import { SafeUser } from '@/app/types';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useLoginModal from '@/app/hooks/useLoginModal';

import Button from '@/app/components/buttons/Button';

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
            <Button
                label={t('host')}
                onClick={() => {}}
                disabled
            />
        );
    }

    if (isPast) {
        return (
            <Button
                label={t('workshop_date_passed')}
                onClick={() => {}}
                disabled
            />
        );
    }

    return (
        <Button
            label={
                loading
                    ? '...'
                    : isParticipant
                      ? t('leave_workshop')
                      : t('join_workshop')
            }
            onClick={handleClick}
            disabled={loading}
            deleteButton={isParticipant}
        />
    );
};

export default JoinWorkshopButton;
