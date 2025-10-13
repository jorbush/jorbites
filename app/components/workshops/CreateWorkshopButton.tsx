'use client';

import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { MdAdd } from 'react-icons/md';

interface CreateWorkshopButtonProps {
    currentUser?: SafeUser | null;
}

const CreateWorkshopButton: React.FC<CreateWorkshopButtonProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();
    const loginModal = useLoginModal();

    const handleClick = () => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        workshopModal.onOpen();
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-rose-600"
            data-cy="create-workshop"
        >
            <MdAdd size={20} />
            <span className="hidden sm:inline">{t('create_workshop')}</span>
            <span className="sm:hidden">
                <MdAdd size={20} />
            </span>
        </button>
    );
};

export default CreateWorkshopButton;
