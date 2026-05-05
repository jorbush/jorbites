import { PiListPlusBold } from 'react-icons/pi';
import { SafeUser } from '@/app/types';
import useAddToListModal from '@/app/hooks/useAddToListModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useTranslation } from 'react-i18next';

interface AddToListButtonProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const AddToListButton: React.FC<AddToListButtonProps> = ({
    recipeId,
    currentUser,
}) => {
    const addToListModal = useAddToListModal();
    const loginModal = useLoginModal();
    const { t } = useTranslation();

    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation();
        if (!currentUser) {
            return loginModal.onOpen();
        }
        addToListModal.onOpen(recipeId);
    };

    return (
        <button
            onClick={handleButtonClick}
            className="relative cursor-pointer transition hover:opacity-80"
            data-cy="add-to-list-button"
            title={t('add_to_list') || 'Add to list'}
        >
            <PiListPlusBold
                size={28}
                className="fill-neutral-500/70 hover:fill-black dark:hover:fill-white"
            />
        </button>
    );
};

export default AddToListButton;
