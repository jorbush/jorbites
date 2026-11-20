'use client';

import Modal from '@/app/components/modals/Modal';
import QuestModalBody from './quest/QuestModalBody';
import { useQuestForm } from './quest/useQuestForm';

const QuestModal = () => {
    const {
        isOpen,
        onClose,
        isEditMode,
        editQuestData,
        isLoading,
        register,
        errors,
        statusValue,
        modalTitle,
        modalSubtitle,
        actionLabel,
        handleFormSubmit,
    } = useQuestForm();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleFormSubmit}
            actionLabel={actionLabel}
            title={modalTitle}
            body={
                <QuestModalBody
                    title={modalTitle}
                    subtitle={modalSubtitle}
                    isEditMode={isEditMode}
                    isLoading={isLoading}
                    register={register}
                    errors={errors}
                    statusValue={statusValue}
                    recipes={editQuestData?.recipes}
                />
            }
            isLoading={isLoading}
        />
    );
};

export default QuestModal;
