'use client';

import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { axiosFetcher } from '@/app/utils/fetcher';
import {
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';
import {
    WORKSHOP_STEPS,
    workshopReducer,
} from '@/app/components/modals/workshopReducer';

interface UseWorkshopFormStateProps {
    workshopModal: any;
}

export function useWorkshopFormState({
    workshopModal,
}: UseWorkshopFormStateProps) {
    const { push, refresh } = useRouter() || {};
    const { t } = useTranslation();

    const [state, dispatch] = useReducer(workshopReducer, {
        step: WORKSHOP_STEPS.INFO,
        isLoading: false,
        numIngredients: 0,
        numPreviousSteps: 0,
        selectedUsers: [],
    });
    const { step, isLoading, numIngredients, numPreviousSteps, selectedUsers } =
        state;

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
        dispatch({ type: 'SET_SELECTED_USERS', payload: whitelistedUsersData });
    }

    if (
        isPrivate !== prevIsPrivateRef.current ||
        currentLength !== prevWhitelistedUserIdsLengthRef.current
    ) {
        prevIsPrivateRef.current = isPrivate;
        prevWhitelistedUserIdsLengthRef.current = currentLength;
        if (!isPrivate || currentLength === 0) {
            dispatch({ type: 'SET_SELECTED_USERS', payload: [] });
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
                dispatch({
                    type: 'SET_NUM_INGREDIENTS',
                    payload: data.ingredients.length,
                });
                dispatch({
                    type: 'SET_NUM_PREVIOUS_STEPS',
                    payload: data.previousSteps.length,
                });

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
        dispatch({ type: 'SET_STEP', payload: step - 1 });
    };

    const onNext = () => {
        dispatch({ type: 'SET_STEP', payload: step + 1 });
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== WORKSHOP_STEPS.IMAGE) {
            return onNext();
        }
        dispatch({ type: 'SET_LOADING', payload: true });

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
            dispatch({ type: 'RESET_MODAL' });
            workshopModal.onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || t('something_went_wrong')
            );
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
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
        dispatch({ type: 'SET_NUM_INGREDIENTS', payload: numIngredients + 1 });
    };

    const addPreviousStep = () => {
        if (numPreviousSteps >= WORKSHOP_MAX_STEPS) {
            toast.error(t('max_previous_steps_reached'));
            return;
        }
        dispatch({
            type: 'SET_NUM_PREVIOUS_STEPS',
            payload: numPreviousSteps + 1,
        });
    };

    const addWhitelistedUser = (user: any) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            toast.error(t('user_already_added') || 'User already added');
            return;
        }
        const newSelectedUsers = [...selectedUsers, user];
        dispatch({ type: 'SET_SELECTED_USERS', payload: newSelectedUsers });
        setValue(
            'whitelistedUserIds',
            newSelectedUsers.map((u) => u.id)
        );
    };

    const removeWhitelistedUser = (userId: string) => {
        const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
        dispatch({ type: 'SET_SELECTED_USERS', payload: newSelectedUsers });
        setValue(
            'whitelistedUserIds',
            newSelectedUsers.map((u) => u.id)
        );
    };

    const removeIngredient = (index: number) => {
        dispatch({ type: 'SET_NUM_INGREDIENTS', payload: numIngredients - 1 });
        setValue(`ingredient-${index}`, '');
    };

    const removePreviousStep = (index: number) => {
        dispatch({
            type: 'SET_NUM_PREVIOUS_STEPS',
            payload: numPreviousSteps - 1,
        });
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

    const handleReset = useCallback(() => {
        reset();
        dispatch({ type: 'RESET_MODAL' });
    }, [reset]);

    return {
        step,
        isLoading,
        numIngredients,
        numPreviousSteps,
        selectedUsers,
        register,
        handleSubmit,
        setValue,
        watch,
        errors,
        reset: handleReset,
        isPrivate,
        isRecurrent,
        imageSrc,
        whitelistedUserIds,
        onBack,
        onNext,
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
    };
}
