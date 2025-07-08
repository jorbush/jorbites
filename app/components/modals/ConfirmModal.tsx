'use client';

import Modal from '@/app/components/modals/Modal';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';

interface ConfirmModalProps {
    open: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
    description?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    setIsOpen,
    onConfirm,
    description,
}) => {
    const { t } = useTranslation();

    const onAccept = () => {
        onConfirm();
        setIsOpen(false);
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title={t('confirm_title')} />
            {description && (
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {description}
                </p>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={open}
            title={t('delete') ?? 'Delete'}
            actionLabel={t('delete')}
            onClose={() => setIsOpen(false)}
            secondaryActionLabel={t('cancel') ?? 'Cancel'}
            secondaryAction={() => setIsOpen(false)}
            onSubmit={onAccept}
            body={bodyContent}
            footer={<div></div>}
        />
    );
};

export default ConfirmModal;
