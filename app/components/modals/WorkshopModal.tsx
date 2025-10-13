'use client';

import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import Modal from '@/app/components/modals/Modal';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import Input from '@/app/components/inputs/Input';
import {
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';

interface WorkshopModalProps {
    currentUser?: SafeUser | null;
}

enum WORKSHOP_STEPS {
    INFO = 0,
    REQUIREMENTS = 1,
    PRIVACY = 2,
    IMAGE = 3,
}

const WorkshopModal: React.FC<WorkshopModalProps> = ({ currentUser }) => {
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
            ingredients: [],
            previousSteps: [],
        },
    });

    const isPrivate = watch('isPrivate');
    const isRecurrent = watch('isRecurrent');
    const imageSrc = watch('imageSrc');

    useEffect(() => {
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
            if (data.whitelistedUsers) {
                setSelectedUsers(data.whitelistedUsers);
            }
        }
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

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'jorbites');

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                const data = await response.json();
                setCustomValue('imageSrc', data.secure_url);
                toast.success(t('image_updated'));
            } catch (error) {
                toast.error(t('something_went_wrong'));
            }
        },
        [setCustomValue, t]
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
            <Input
                id="date"
                label={t('date')}
                type="datetime-local"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
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
                    className="h-5 w-5"
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
                    className="w-full rounded-lg border-2 p-4 transition outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800 dark:text-white"
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
                <Input
                    id="price"
                    label={t('price_per_person')}
                    type="number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    formatPrice
                />
                <div>
                    <label className="text-md font-semibold">
                        {t('ingredients')}
                    </label>
                    {Array.from({ length: numIngredients }).map((_, i) => (
                        <Input
                            key={i}
                            id={`ingredient-${i}`}
                            label={`${t('ingredients')} ${i + 1}`}
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        + {t('ingredients')}
                    </button>
                </div>
                <div>
                    <label className="text-md font-semibold">
                        {t('previous_steps')}
                    </label>
                    <p className="mb-2 text-sm text-neutral-500">
                        {t('previous_steps_description')}
                    </p>
                    {Array.from({ length: numPreviousSteps }).map((_, i) => (
                        <Input
                            key={i}
                            id={`previousStep-${i}`}
                            label={`${t('previous_steps')} ${i + 1}`}
                            disabled={isLoading}
                            register={register}
                            errors={errors}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addPreviousStep}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        + {t('previous_steps')}
                    </button>
                </div>
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
                        className="h-5 w-5"
                    />
                    <label
                        htmlFor="isPrivate"
                        className="text-md font-semibold"
                    >
                        {t('private_workshop')}
                    </label>
                </div>
                {isPrivate && (
                    <div>
                        <p className="mb-2 text-sm text-neutral-500">
                            {t('workshop_whitelist_description')}
                        </p>
                        {/* TODO: Add user search and selection component */}
                        <div className="text-sm text-gray-500">
                            {t('workshop_whitelist')} - Feature coming soon
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (step === WORKSHOP_STEPS.IMAGE) {
        bodyContent = (
            <div className="flex flex-col gap-4">
                <label className="text-md font-semibold">
                    {t('workshop_image')}
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="workshop-image-upload"
                    />
                    <label
                        htmlFor="workshop-image-upload"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-20 transition hover:opacity-70"
                    >
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt="Workshop"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center">
                                <FiUploadCloud size={50} />
                                <p className="mt-2 font-semibold">
                                    {t('images_subtitle')}
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            </div>
        );
    }

    return (
        <Modal
            isOpen={workshopModal.isOpen}
            title={
                workshopModal.isEditMode
                    ? t('edit_workshop')
                    : t('create_workshop')
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
            }}
            body={bodyContent}
            disabled={isLoading}
        />
    );
};

export default WorkshopModal;
