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
import {
    DailyNutritionTargets,
    getSuggestedMealSlotForDay,
    RemainingMacroBudget,
} from '@/app/utils/planningNutrition';
import { PlanningModalFormData } from '@/app/components/modals/PlanningModal';
import { MacroSuggestionContext } from '@/app/components/modals/RecipeSelectBudgetBar';

interface UsePlanningStateProps {
    planning: SafePlanning;
    currentUser?: SafeUser | null;
}

export function usePlanningState({
    planning,
    currentUser,
}: UsePlanningStateProps) {
    const { push, refresh, back } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const { share } = useShare();
    const loginModal = useLoginModal();

    const isOwner = currentUser?.id === planning.userId;

    const [isSaved, setIsSaved] = useState(
        () => currentUser?.savedPlanningIds?.includes(planning.id) || false
    );

    // View/Edit mode states
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [editedName, setEditedName] = useState(planning.name);
    const [editedDesc, setEditedDesc] = useState(planning.description || '');
    const [isPrivate, setIsPrivate] = useState(planning.isPrivate);
    const [dailyTargets, setDailyTargets] = useState<DailyNutritionTargets>({
        targetCalories: planning.targetCalories ?? null,
        targetProtein: planning.targetProtein ?? null,
        targetCarbohydrates: planning.targetCarbohydrates ?? null,
        targetFat: planning.targetFat ?? null,
    });
    const [meals, setMeals] = useState<any[]>(planning.meals || []);
    const [isSaving, setIsSaving] = useState(false);

    // Modal active states
    const [isRecipeSelectOpen, setIsRecipeSelectOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<{
        day: string;
        mealType: string;
    } | null>(null);
    const [suggestionContext, setSuggestionContext] =
        useState<MacroSuggestionContext | null>(null);
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [isCalendarExportOpen, setIsCalendarExportOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

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

    // Update plan metadata & optional daily nutrition targets via PlanningModal
    const handleUpdatePlanning = async (data: PlanningModalFormData) => {
        setIsSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate,
                meals: meals.map((m) => ({
                    day: m.day,
                    mealType: m.mealType,
                    recipeId: m.recipeId,
                })),
            };

            if (data.targetCalories !== undefined) {
                payload.targetCalories = data.targetCalories;
            }
            if (data.targetProtein !== undefined) {
                payload.targetProtein = data.targetProtein;
            }
            if (data.targetCarbohydrates !== undefined) {
                payload.targetCarbohydrates = data.targetCarbohydrates;
            }
            if (data.targetFat !== undefined) {
                payload.targetFat = data.targetFat;
            }

            await axios.patch(`/api/plannings/${planning.id}`, payload);
            setEditedName(data.name);
            setEditedDesc(data.description);
            setIsPrivate(data.isPrivate);
            setDailyTargets((prev) => ({
                targetCalories:
                    data.targetCalories !== undefined
                        ? data.targetCalories
                        : prev.targetCalories,
                targetProtein:
                    data.targetProtein !== undefined
                        ? data.targetProtein
                        : prev.targetProtein,
                targetCarbohydrates:
                    data.targetCarbohydrates !== undefined
                        ? data.targetCarbohydrates
                        : prev.targetCarbohydrates,
                targetFat:
                    data.targetFat !== undefined
                        ? data.targetFat
                        : prev.targetFat,
            }));
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
        setSuggestionContext(null);
        setActiveSlot({ day, mealType });
        setIsRecipeSelectOpen(true);
    };

    // Open recipe suggestions pre-filtered to remaining daily macro budget
    const handleFillRemainingMacros = useCallback(
        (
            day: string,
            suggestedSlot: string | null,
            remainingBudget: RemainingMacroBudget
        ) => {
            if (!currentUser) {
                loginModal.onOpen();
                return;
            }

            if (isOwner) {
                const { availableSlots } = getSuggestedMealSlotForDay(
                    day,
                    groupedMeals
                );
                const resolvedSlot = suggestedSlot ?? availableSlots[0] ?? null;
                if (!resolvedSlot) {
                    return;
                }

                setActiveSlot({ day, mealType: resolvedSlot });
                setSuggestionContext({
                    day,
                    mealType: resolvedSlot,
                    availableMealTypes: availableSlots,
                    onMealTypeChange: (nextMealType: string) => {
                        setActiveSlot({ day, mealType: nextMealType });
                        setSuggestionContext((prev) =>
                            prev ? { ...prev, mealType: nextMealType } : prev
                        );
                    },
                    initialBudget: remainingBudget.initialFilters,
                    optionalBudget: remainingBudget.optionalFilters,
                });
                setIsRecipeSelectOpen(true);
                return;
            }

            setActiveSlot(null);
            setSuggestionContext({
                day,
                mealType: null,
                initialBudget: remainingBudget.initialFilters,
                optionalBudget: remainingBudget.optionalFilters,
            });
            setIsRecipeSelectOpen(true);
        },
        [currentUser, groupedMeals, isOwner, loginModal]
    );

    const handleCloseRecipeSelect = useCallback(() => {
        setIsRecipeSelectOpen(false);
        setActiveSlot(null);
        setSuggestionContext(null);
    }, []);

    const handleRecipeSelect = async (recipe: any) => {
        if (!activeSlot) {
            if (!isOwner && recipe?.id) {
                setIsRecipeSelectOpen(false);
                setSuggestionContext(null);
                push?.(`/recipes/${recipe.id}`);
            }
            return;
        }

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
                categories: recipe.categories || [],
                description: recipe.description || '',
                user: recipe.user || {},
                calories: recipe.calories ?? null,
                protein: recipe.protein ?? null,
                carbohydrates: recipe.carbohydrates ?? null,
                fat: recipe.fat ?? null,
                fiber: recipe.fiber ?? null,
                difficulty: recipe.difficulty ?? null,
                dietaryTags: recipe.dietaryTags || [],
                allergens: recipe.allergens || [],
            },
        };

        const updatedMeals = [...meals, newMeal];
        setMeals(updatedMeals);
        setIsRecipeSelectOpen(false);
        setActiveSlot(null);
        setSuggestionContext(null);

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
            setIsPrivate((prevIsPrivate) => !prevIsPrivate);
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

    const handleDeletePlanning = useCallback(async () => {
        if (!isOwner) return;
        setIsSaving(true);
        try {
            await axios.delete(`/api/plannings/${planning.id}`);
            toast.success(t('meal_plan_deleted') || 'Meal plan deleted');
            if (push) push('/plannings');
            if (refresh) refresh();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
            setIsConfirmDeleteOpen(false);
        }
    }, [isOwner, planning.id, push, refresh, t]);

    return {
        push,
        back,
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
        dailyTargets,
        meals,
        isSaving,
        isRecipeSelectOpen,
        setIsRecipeSelectOpen,
        activeSlot,
        setActiveSlot,
        suggestionContext,
        handleCloseRecipeSelect,
        handleFillRemainingMacros,
        isShoppingListOpen,
        setIsShoppingListOpen,
        isCalendarExportOpen,
        setIsCalendarExportOpen,
        isConfirmDeleteOpen,
        setIsConfirmDeleteOpen,
        groupedMeals,
        handleUpdatePlanning,
        handleAddRecipeClick,
        handleRecipeSelect,
        handleRemoveRecipe,
        handleSaveToggle,
        togglePrivacy,
        handleDeletePlanning,
    };
}
