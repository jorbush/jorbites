'use client';

import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import Modal from '@/app/components/modals/Modal';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import WorkshopImageStep from '@/app/components/modals/workshop-steps/WorkshopImageStep';
import {
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';
import WorkshopInfoStep from './workshop-steps/WorkshopInfoStep';
import WorkshopRequirementsStep from './workshop-steps/WorkshopRequirementsStep';
import WorkshopPrivacyStep from './workshop-steps/WorkshopPrivacyStep';
import { SafeUser } from '@/app/types';

interface WorkshopModalProps {
    currentUser?: SafeUser | null;
}

enum WORKSHOP_STEPS {
    INFO = 0,
    REQUIREMENTS = 1,
    PRIVACY = 2,
    IMAGE = 3,
}

const WorkshopModal: React.FC<WorkshopModalProps> = ({
    currentUser: _currentUser,
}) => {
    const { push, refresh } = useRouter() || {};
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();
    const [step, setStep] = useState(WORKSHOP_STEPS.INFO);
    const [isLoading, setIsLoading] = useState(false);
    const [numIngredients, setNumIngredients] = useState(0);
    const [numPreviousSteps, setNumPreviousSteps] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            title: '',
            description: '',
            date: '',
            location: '',
            isRecurrent: false,
            recurrencePattern: '',
            isPrivate: false,
            whitelistedUserIds: [],
            imageSrc: '',
            price: 0,
            currency: 'EUR',
            ingredients: [],
            previousSteps: [],
        },
    });

    const isPrivate = watch('isPrivate');
    const isRecurrent = watch('isRecurrent');
    const imageSrc = watch('imageSrc');
    const whitelistedUserIds = watch('whitelistedUserIds') || [];

    const { data: whitelistedUsersData } = useSWR(
        workshopModal.isOpen && isPrivate && whitelistedUserIds.length > 0
            ? `/api/users/multiple?ids=${whitelistedUserIds.join(',')}`
            : null,
        axiosFetcher
    );

    const prevWhitelistedUsersDataRef = useRef<any>(null);
    const prevIsPrivateRef = useRef<boolean>(isPrivate);
    const currentLength = whitelistedUserIds?.length || 0;
    const prevWhitelistedUserIdsLengthRef = useRef<number>(currentLength);

    if (
        whitelistedUsersData &&
        whitelistedUsersData !== prevWhitelistedUsersDataRef.current
    ) {
        prevWhitelistedUsersDataRef.current = whitelistedUsersData;
        setSelectedUsers(whitelistedUsersData);
    }

    if (
        isPrivate !== prevIsPrivateRef.current ||
        currentLength !== prevWhitelistedUserIdsLengthRef.current
    ) {
        prevIsPrivateRef.current = isPrivate;
        prevWhitelistedUserIdsLengthRef.current = currentLength;
        if (!isPrivate || currentLength === 0) {
            setSelectedUsers([]);
        }
    }

    useEffect(() => {
        const loadEditData = async () => {
            if (workshopModal.isEditMode && workshopModal.editWorkshopData) {
                const data = workshopModal.editWorkshopData;
                setValue('title', data.title);
                setValue('description', data.description);
                setValue('date', data.date.slice(0, 16));
                setValue('location', data.location);
                setValue('isRecurrent', data.isRecurrent);
                setValue('recurrencePattern', data.recurrencePattern || '');
                setValue('isPrivate', data.isPrivate);
                setValue('whitelistedUserIds', data.whitelistedUserIds);
                setValue('imageSrc', data.imageSrc || '');
                setValue('price', data.price);
                setValue('ingredients', data.ingredients);
                setValue('previousSteps', data.previousSteps);
                setNumIngredients(data.ingredients.length);
                setNumPreviousSteps(data.previousSteps.length);

                data.ingredients.forEach(
                    (ingredient: string, index: number) => {
                        setValue(`ingredient-${index}`, ingredient);
                    }
                );

                data.previousSteps.forEach((step: string, index: number) => {
                    setValue(`previousStep-${index}`, step);
                });
            }
        };

        loadEditData();
    }, [workshopModal.isEditMode, workshopModal.editWorkshopData, setValue]);

    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== WORKSHOP_STEPS.IMAGE) {
            return onNext();
        }
        setIsLoading(true);

        try {
            const ingredients = [];
            for (let i = 0; i < numIngredients; i++) {
                if (data[`ingredient-${i}`]) {
                    ingredients.push(data[`ingredient-${i}`]);
                }
            }

            const previousSteps = [];
            for (let i = 0; i < numPreviousSteps; i++) {
                if (data[`previousStep-${i}`]) {
                    previousSteps.push(data[`previousStep-${i}`]);
                }
            }

            const workshopData = {
                title: data.title,
                description: data.description,
                date: new Date(data.date).toISOString(),
                location: data.location,
                isRecurrent: data.isRecurrent,
                recurrencePattern: data.isRecurrent
                    ? data.recurrencePattern
                    : null,
                isPrivate: data.isPrivate,
                whitelistedUserIds: data.isPrivate
                    ? data.whitelistedUserIds
                    : [],
                imageSrc: data.imageSrc,
                price: parseFloat(data.price) || 0,
                currency: data.currency,
                ingredients,
                previousSteps,
            };

            if (workshopModal.isEditMode && workshopModal.editWorkshopData) {
                await axios.patch(
                    `/api/workshop/${workshopModal.editWorkshopData.id}`,
                    workshopData
                );
                toast.success(t('workshop_updated'));
            } else {
                const response = await axios.post(
                    '/api/workshops',
                    workshopData
                );
                toast.success(t('workshop_created'));
                push(`/workshops/${response.data.id}`);
            }

            refresh();
            reset();
            setStep(WORKSHOP_STEPS.INFO);
            workshopModal.onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || t('something_went_wrong')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const setCustomValue = useCallback(
        (id: string, value: any) => {
            setValue(id, value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
        },
        [setValue]
    );

    const addIngredient = () => {
        if (numIngredients >= WORKSHOP_MAX_INGREDIENTS) {
            toast.error(t('max_ingredients_reached'));
            return;
        }
        setNumIngredients((prev) => prev + 1);
    };

    const addPreviousStep = () => {
        if (numPreviousSteps >= WORKSHOP_MAX_STEPS) {
            toast.error(t('max_previous_steps_reached'));
            return;
        }
        setNumPreviousSteps((prev) => prev + 1);
    };

    const addWhitelistedUser = (user: any) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            toast.error(t('user_already_added') || 'User already added');
            return;
        }
        const newSelectedUsers = [...selectedUsers, user];
        setSelectedUsers(newSelectedUsers);
        setValue(
            'whitelistedUserIds',
            newSelectedUsers.map((u) => u.id)
        );
    };

    const removeWhitelistedUser = (userId: string) => {
        const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
        setSelectedUsers(newSelectedUsers);
        setValue(
            'whitelistedUserIds',
            newSelectedUsers.map((u) => u.id)
        );
    };

    const removeIngredient = (index: number) => {
        setNumIngredients((value) => value - 1);
        setValue(`ingredient-${index}`, '');
    };

    const removePreviousStep = (index: number) => {
        setNumPreviousSteps((value) => value - 1);
        setValue(`previousStep-${index}`, '');
    };

    const actionLabel = useMemo(() => {
        if (step === WORKSHOP_STEPS.IMAGE) {
            return workshopModal.isEditMode ? t('update') : t('create');
        }
        return t('next');
    }, [step, workshopModal.isEditMode, t]);

    const secondaryActionLabel = useMemo(() => {
        if (step === WORKSHOP_STEPS.INFO) {
            return undefined;
        }
        return t('back');
    }, [step, t]);

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
                setStep(WORKSHOP_STEPS.INFO);
                setNumIngredients(0);
                setNumPreviousSteps(0);
                setSelectedUsers([]);
            }}
            body={bodyContent}
            disabled={isLoading}
        />
    );
};

export default WorkshopModal;
