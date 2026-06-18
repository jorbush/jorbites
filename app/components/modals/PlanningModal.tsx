'use client';

import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Modal from '@/app/components/modals/Modal';
import Input from '@/app/components/inputs/Input';
import Textarea from '@/app/components/inputs/Textarea';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { useTranslation } from 'react-i18next';

interface PlanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => void;
    title: string;
    actionLabel: string;
    initialValues?: { name: string; description: string; isPrivate: boolean };
    isLoading?: boolean;
}

const PlanningModal: React.FC<PlanningModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    actionLabel,
    initialValues,
    isLoading,
}) => {
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: initialValues || {
            name: '',
            description: '',
            isPrivate: true,
        },
    });

    const handleFormSubmit: SubmitHandler<FieldValues> = (data) => {
        onSubmit({
            name: data.name,
            description: data.description,
            isPrivate: data.isPrivate,
        });
    };

    const isPrivate = watch('isPrivate');

    const bodyContent = (
        <div className="flex flex-col gap-4 text-neutral-900 dark:text-neutral-100">
            <Input
                id="name"
                label={t('plan_name')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                dataCy="plan-name-input"
            />
            <Textarea
                id="description"
                label={t('plan_description')}
                disabled={isLoading}
                register={register}
                errors={errors}
                dataCy="plan-description-textarea"
                rows={3}
            />
            <div className="flex flex-row items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-800">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {t('private_list') || 'Private Plan'}
                    </span>
                    <span className="text-xs font-light text-neutral-400">
                        {isPrivate ? t('plan_is_private') : t('plan_is_public')}
                    </span>
                </div>
                <ToggleSwitch
                    checked={isPrivate}
                    onChange={() => setValue('isPrivate', !isPrivate)}
                    disabled={isLoading}
                    dataCy="plan-private-toggle"
                />
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit(handleFormSubmit)}
            actionLabel={actionLabel}
            title={title}
            body={bodyContent}
            isLoading={isLoading}
        />
    );
};

export default PlanningModal;
