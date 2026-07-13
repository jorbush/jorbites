'use client';

import { useReducer, useCallback, useRef, useMemo, useState } from 'react';
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

    const isEditMode = workshopModal.isEditMode;
    const editData = workshopModal.editWorkshopData;

    const [prevEditWorkshopData, setPrevEditWorkshopData] = useState<any>(null);
    if (editData !== prevEditWorkshopData) {
        setPrevEditWorkshopData(editData);
        if (isEditMode && editData) {
            dispatch({
                type: 'SET_NUM_INGREDIENTS',
                payload: editData.ingredients.length,
            });
            dispatch({
                type: 'SET_NUM_PREVIOUS_STEPS',
                payload: editData.previousSteps.length,
            });
        } else {
            dispatch({ type: 'RESET_MODAL' });
        }
    }

    const { step, isLoading, numIngredients, numPreviousSteps, selectedUsers } =
        state;

    const defaultValues = useMemo(() => {
        if (isEditMode && editData) {
            const ingredientsObject: Record<string, string> = {};
            editData.ingredients.forEach(
                (ingredient: string, index: number) => {
                    ingredientsObject[`ingredient-${index}`] = ingredient;
                }
            );

            const previousStepsObject: Record<string, string> = {};
            editData.previousSteps.forEach((step: string, index: number) => {
                previousStepsObject[`previousStep-${index}`] = step;
            });

            return {
                title: editData.title,
                description: editData.description,
                date: editData.date.slice(0, 16),
                location: editData.location,
                isRecurrent: editData.isRecurrent,
                recurrencePattern: editData.recurrencePattern || '',
                isPrivate: editData.isPrivate,
                whitelistedUserIds: editData.whitelistedUserIds,
                imageSrc: editData.imageSrc || '',
                price: editData.price,
                ingredients: editData.ingredients,
                previousSteps: editData.previousSteps,
                ...ingredientsObject,
                ...previousStepsObject,
            };
        }
        return {
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
        };
    }, [isEditMode, editData]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues,
        values: defaultValues,
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

    const [prevWhitelistedUsersData, setPrevWhitelistedUsersData] = useState<any>(null);
    const [prevIsPrivate, setPrevIsPrivate] = useState<boolean>(isPrivate);
    const currentLength = whitelistedUserIds?.length || 0;
    const [prevWhitelistedUserIdsLength, setPrevWhitelistedUserIdsLength] = useState<number>(currentLength);

    if (
        whitelistedUsersData &&
        whitelistedUsersData !== prevWhitelistedUsersData
    ) {
        setPrevWhitelistedUsersData(whitelistedUsersData);
        dispatch({ type: 'SET_SELECTED_USERS', payload: whitelistedUsersData });
    }

    if (
        isPrivate !== prevIsPrivate ||
        currentLength !== prevWhitelistedUserIdsLength
    ) {
        setPrevIsPrivate(isPrivate);
        setPrevWhitelistedUserIdsLength(currentLength);
        if (!isPrivate || currentLength === 0) {
            dispatch({ type: 'SET_SELECTED_USERS', payload: [] });
        }
    }

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
