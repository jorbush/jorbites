'use client';

import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useShare from '@/app/hooks/useShare';
import useLoginModal from '@/app/hooks/useLoginModal';
import { SafePlanning, SafeUser } from '@/app/types';
import {
    DAYS_OF_WEEK,
    MEAL_TYPES,
    MAX_RECIPES_PER_MEAL,
} from '@/app/utils/constants';

interface UsePlanningStateProps {
    planning: SafePlanning;
    currentUser?: SafeUser | null;
}

export function usePlanningState({
    planning,
    currentUser,
}: UsePlanningStateProps) {
    const { push, refresh } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const { share } = useShare();
    const loginModal = useLoginModal();

    const isOwner = currentUser?.id === planning.userId;

    const [isSaved, setIsSaved] = useState(
        currentUser?.savedPlanningIds?.includes(planning.id) || false
    );

    // View/Edit mode states
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [editedName, setEditedName] = useState(planning.name);
    const [editedDesc, setEditedDesc] = useState(planning.description || '');
    const [isPrivate, setIsPrivate] = useState(planning.isPrivate);
    const [meals, setMeals] = useState<any[]>(planning.meals || []);
    const [isSaving, setIsSaving] = useState(false);

    // Modal active states
    const [isRecipeSelectOpen, setIsRecipeSelectOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<{
        day: string;
        mealType: string;
    } | null>(null);
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [isCalendarExportOpen, setIsCalendarExportOpen] = useState(false);

    // Grouped meals map for quick lookup
    const groupedMeals = useMemo(() => {
        const map: Record<string, any[]> = {};
        DAYS_OF_WEEK.forEach((day) => {
            MEAL_TYPES.forEach((mealType) => {
                map[`${day}-${mealType}`] = [];
            });
        });

        meals.forEach((meal) => {
            const key = `${meal.day.toLowerCase()}-${meal.mealType.toLowerCase()}`;
            if (map[key]) {
                map[key].push(meal);
            }
        });
        return map;
    }, [meals]);

    // Save meals list directly to database (auto-save)
    const saveMeals = async (updatedMeals: any[]) => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/plannings/${planning.id}`, {
                name: editedName,
                description: editedDesc,
                isPrivate: isPrivate,
                meals: updatedMeals.map((m) => ({
                    day: m.day,
                    mealType: m.mealType,
                    recipeId: m.recipeId,
                })),
            });
            toast.success(t('meal_plan_updated'));
            refresh?.();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    };

    // Update plan metadata via PlanningModal
    const handleUpdatePlanning = async (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => {
        setIsSaving(true);
        try {
            await axios.patch(`/api/plannings/${planning.id}`, {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate,
                meals: meals.map((m) => ({
                    day: m.day,
                    mealType: m.mealType,
                    recipeId: m.recipeId,
                })),
            });
            setEditedName(data.name);
            setEditedDesc(data.description);
            setIsPrivate(data.isPrivate);
            toast.success(t('meal_plan_updated'));
            setIsPlanningModalOpen(false);
            refresh?.();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    };

    // Add recipe to slot
    const handleAddRecipeClick = (day: string, mealType: string) => {
        setActiveSlot({ day, mealType });
        setIsRecipeSelectOpen(true);
    };

    const handleRecipeSelect = async (recipe: any) => {
        if (!activeSlot) return;

        const currentSlotMeals = meals.filter(
            (m) =>
                m.day.toLowerCase() === activeSlot.day.toLowerCase() &&
                m.mealType.toLowerCase() === activeSlot.mealType.toLowerCase()
        );

        if (currentSlotMeals.length >= MAX_RECIPES_PER_MEAL) {
            toast.error(t('max_recipes_per_meal_reached'));
            return;
        }

        const newMeal = {
            id: `temp-${Date.now()}-${Math.random()}`,
            day: activeSlot.day,
            mealType: activeSlot.mealType,
            recipeId: recipe.id,
            recipe: {
                id: recipe.id,
                title: recipe.title,
                imageSrc: recipe.imageSrc,
                ingredients: recipe.ingredients || [],
                description: recipe.description || '',
                user: recipe.user || {},
                calories: recipe.calories || null,
            },
        };

        const updatedMeals = [...meals, newMeal];
        setMeals(updatedMeals);
        setIsRecipeSelectOpen(false);
        setActiveSlot(null);

        await saveMeals(updatedMeals);
    };

    // Remove recipe from slot
    const handleRemoveRecipe = async (mealId: string) => {
        const updatedMeals = meals.filter((m) => m.id !== mealId);
        setMeals(updatedMeals);

        await saveMeals(updatedMeals);
    };

    // Toggle save plan (bookmark)
    const handleSaveToggle = useCallback(async () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                await axios.delete(`/api/saves/${planning.id}`);
                setIsSaved(false);
                toast.success(t('meal_plan_updated'));
            } else {
                await axios.post(`/api/saves/${planning.id}`);
                setIsSaved(true);
                toast.success(t('meal_plan_updated'));
            }
            refresh?.();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    }, [currentUser, isSaved, planning.id, loginModal, refresh, t]);

    // Toggle privacy setting
    const togglePrivacy = useCallback(async () => {
        if (!isOwner) return;
        setIsSaving(true);
        try {
            await axios.patch(`/api/plannings/${planning.id}`, {
                name: editedName,
                description: editedDesc,
                isPrivate: !isPrivate,
                meals: meals.map((m) => ({
                    day: m.day,
                    mealType: m.mealType,
                    recipeId: m.recipeId,
                })),
            });
            setIsPrivate(!isPrivate);
            toast.success(
                !isPrivate ? t('plan_is_private') : t('plan_is_public')
            );
            refresh?.();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    }, [
        isOwner,
        isPrivate,
        editedName,
        editedDesc,
        meals,
        planning.id,
        refresh,
        t,
    ]);

    return {
        push,
        t,
        i18n,
        share,
        isOwner,
        isSaved,
        isPlanningModalOpen,
        setIsPlanningModalOpen,
        editedName,
        editedDesc,
        isPrivate,
        meals,
        isSaving,
        isRecipeSelectOpen,
        setIsRecipeSelectOpen,
        activeSlot,
        setActiveSlot,
        isShoppingListOpen,
        setIsShoppingListOpen,
        isCalendarExportOpen,
        setIsCalendarExportOpen,
        groupedMeals,
        handleUpdatePlanning,
        handleAddRecipeClick,
        handleRecipeSelect,
        handleRemoveRecipe,
        handleSaveToggle,
        togglePrivacy,
    };
}
