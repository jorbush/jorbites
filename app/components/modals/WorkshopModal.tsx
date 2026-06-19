'use client';

import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import WorkshopImageStep from '@/app/components/modals/workshop-steps/WorkshopImageStep';
import WorkshopInfoStep from './workshop-steps/WorkshopInfoStep';
import WorkshopRequirementsStep from './workshop-steps/WorkshopRequirementsStep';
import WorkshopPrivacyStep from './workshop-steps/WorkshopPrivacyStep';
import { SafeUser } from '@/app/types';
import { WORKSHOP_STEPS } from './workshopReducer';
import { useWorkshopFormState } from '@/app/hooks/useWorkshopFormState';

interface WorkshopModalProps {
    currentUser?: SafeUser | null;
}

const WorkshopModal: React.FC<WorkshopModalProps> = ({
    currentUser: _currentUser,
}) => {
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();

    const {
        step,
        isLoading,
        numIngredients,
        numPreviousSteps,
        selectedUsers,
        register,
        handleSubmit,
        errors,
        reset,
        isPrivate,
        isRecurrent,
        imageSrc,
        onBack,
        onSubmit,
        setCustomValue,
        addIngredient,
        addPreviousStep,
        addWhitelistedUser,
        removeWhitelistedUser,
        removeIngredient,
        removePreviousStep,
        actionLabel,
        secondaryActionLabel,
    } = useWorkshopFormState({ workshopModal });

    let bodyContent = (
        <WorkshopInfoStep
            register={register}
            errors={errors}
            isLoading={isLoading}
            isRecurrent={isRecurrent}
            t={t}
        />
    );

    if (step === WORKSHOP_STEPS.REQUIREMENTS) {
        bodyContent = (
            <WorkshopRequirementsStep
                register={register}
                errors={errors}
                isLoading={isLoading}
                numIngredients={numIngredients}
                numPreviousSteps={numPreviousSteps}
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
                onAddPreviousStep={addPreviousStep}
                onRemovePreviousStep={removePreviousStep}
                t={t}
            />
        );
    }

    if (step === WORKSHOP_STEPS.PRIVACY) {
        bodyContent = (
            <WorkshopPrivacyStep
                register={register}
                isLoading={isLoading}
                isPrivate={isPrivate}
                selectedUsers={selectedUsers}
                onAddUser={addWhitelistedUser}
                onRemoveUser={removeWhitelistedUser}
                t={t}
            />
        );
    }

    if (step === WORKSHOP_STEPS.IMAGE) {
        bodyContent = (
            <WorkshopImageStep
                imageSrc={imageSrc}
                onImageChange={(value) => setCustomValue('imageSrc', value)}
            />
        );
    }

    return (
        <Modal
            isOpen={workshopModal.isOpen}
            title={
                workshopModal.isEditMode
                    ? String(t('edit_workshop'))
                    : String(t('create_workshop'))
            }
            actionLabel={actionLabel}
            onSubmit={handleSubmit(onSubmit)}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === WORKSHOP_STEPS.INFO ? undefined : onBack}
            onClose={() => {
                workshopModal.onClose();
                reset();
            }}
            body={bodyContent}
            disabled={isLoading}
        />
    );
};

export default WorkshopModal;
