'use client';

import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import Modal from '@/app/components/modals/Modal';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import WorkshopImageStep from '@/app/components/modals/workshop-steps/WorkshopImageStep';
import {
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';
import Input from '../inputs/Input';
import WorkshopIngredientsStep from './workshop-steps/WorkshopIngredientsStep';
import WorkshopPreviousStepsStep from './workshop-steps/WorkshopPreviousStepsStep';
import WhitelistUsersStep from './workshop-steps/WhitelistUsersStep';
import CollapsibleSection from '@/app/components/utils/CollapsibleSection';
import CurrencySelect from '@/app/components/inputs/CurrencySelect';
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
    const router = useRouter();
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

                // Load whitelisted users if private workshop
                if (data.isPrivate && data.whitelistedUserIds.length > 0) {
                    try {
                        const response = await axios.get(
                            `/api/users/multiple?ids=${data.whitelistedUserIds.join(',')}`
                        );
                        setSelectedUsers(response.data);
                    } catch (error) {
                        console.error(
                            'Failed to load whitelisted users',
                            error
                        );
                    }
                }
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
                router.push(`/workshops/${response.data.id}`);
            }

            router.refresh();
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
        setNumIngredients(numIngredients + 1);
    };

    const addPreviousStep = () => {
        if (numPreviousSteps >= WORKSHOP_MAX_STEPS) {
            toast.error(t('max_previous_steps_reached'));
            return;
        }
        setNumPreviousSteps(numPreviousSteps + 1);
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
        <div className="flex flex-col gap-4">
            <Input
                id="title"
                label={t('title')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="description"
                label={t('description')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <div className="flex flex-col">
                <Input
                    id="date"
                    label={t('date')}
                    type="datetime-local"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
            <Input
                id="location"
                label={t('location')}
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <div className="flex items-center gap-2">
                <input
                    id="isRecurrent"
                    type="checkbox"
                    {...register('isRecurrent')}
                    disabled={isLoading}
                    className="accent-green-450 h-5 w-5"
                />
                <label
                    htmlFor="isRecurrent"
                    className="text-md font-semibold"
                >
                    {t('is_recurrent')}
                </label>
            </div>
            {isRecurrent && (
                <select
                    {...register('recurrencePattern')}
                    disabled={isLoading}
                    className="w-full appearance-none rounded-lg border-2 p-4 transition outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800 dark:text-white"
                >
                    <option value="">{t('recurrence_pattern')}</option>
                    <option value="weekly">{t('weekly')}</option>
                    <option value="monthly">{t('monthly')}</option>
                </select>
            )}
        </div>
    );

    if (step === WORKSHOP_STEPS.REQUIREMENTS) {
        bodyContent = (
            <div className="flex flex-col gap-4">
                <CollapsibleSection
                    title={t('price_per_person')}
                    description={t('price_description')}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <Input
                                id="price"
                                label={t('price_per_person')}
                                type="number"
                                disabled={isLoading}
                                register={register}
                                errors={errors}
                                formatPrice
                            />
                        </div>
                        <CurrencySelect
                            id="currency"
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                        />
                    </div>
                </CollapsibleSection>
                <CollapsibleSection
                    title={t('ingredients')}
                    description={t('ingredients_description')}
                >
                    <WorkshopIngredientsStep
                        numIngredients={numIngredients}
                        register={register}
                        errors={errors}
                        onAddIngredient={addIngredient}
                        onRemoveIngredient={removeIngredient}
                    />
                </CollapsibleSection>
                <CollapsibleSection
                    title={t('previous_steps')}
                    description={t('previous_steps_description')}
                >
                    <WorkshopPreviousStepsStep
                        numPreviousSteps={numPreviousSteps}
                        register={register}
                        errors={errors}
                        onAddPreviousStep={addPreviousStep}
                        onRemovePreviousStep={removePreviousStep}
                    />
                </CollapsibleSection>
            </div>
        );
    }

    if (step === WORKSHOP_STEPS.PRIVACY) {
        bodyContent = (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <input
                        id="isPrivate"
                        type="checkbox"
                        {...register('isPrivate')}
                        disabled={isLoading}
                        className="accent-green-450 h-5 w-5"
                    />
                    <label
                        htmlFor="isPrivate"
                        className="text-md font-semibold"
                    >
                        {t('private_workshop')}
                    </label>
                </div>
                {isPrivate && (
                    <WhitelistUsersStep
                        isLoading={isLoading}
                        selectedUsers={selectedUsers}
                        onAddUser={addWhitelistedUser}
                        onRemoveUser={removeWhitelistedUser}
                    />
                )}
            </div>
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
