'use client';

import axios from 'axios';
import { useCallback, useMemo, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { SafePlanning, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import {
    FiShare2,
    FiDownload,
    FiShoppingCart,
    FiPlus,
    FiChevronLeft,
    FiBookmark,
} from 'react-icons/fi';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { IoRestaurantOutline } from 'react-icons/io5';
import { BiCookie } from 'react-icons/bi';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import useShare from '@/app/hooks/useShare';
import useLoginModal from '@/app/hooks/useLoginModal';
import RecipeSelectModal from '@/app/components/modals/RecipeSelectModal';
import PlanningModal from '@/app/components/modals/PlanningModal';
import WeeklyShoppingListModal from '@/app/components/modals/WeeklyShoppingListModal';
import ExportCalendarModal from '@/app/components/modals/ExportCalendarModal';

interface PlanningClientProps {
    planning: SafePlanning;
    currentUser?: SafeUser | null;
}

const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];
const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
const MAX_RECIPES_PER_MEAL = 4;

const PlanningClient: React.FC<PlanningClientProps> = ({
    planning,
    currentUser,
}) => {
    const { push, refresh } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const { share } = useShare();

    const isOwner = currentUser?.id === planning.userId;

    const loginModal = useLoginModal();
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
    const activeSlot = useRef<{
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
            refresh();
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
            refresh();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    };

    // Add recipe to slot
    const handleAddRecipeClick = (day: string, mealType: string) => {
        activeSlot.current = { day, mealType };
        setIsRecipeSelectOpen(true);
    };

    const handleRecipeSelect = async (recipe: any) => {
        if (!activeSlot.current) return;

        const currentSlotMeals = meals.filter(
            (m) =>
                m.day.toLowerCase() === activeSlot.current!.day.toLowerCase() &&
                m.mealType.toLowerCase() ===
                    activeSlot.current!.mealType.toLowerCase()
        );

        if (currentSlotMeals.length >= MAX_RECIPES_PER_MEAL) {
            toast.error(t('max_recipes_per_meal_reached'));
            return;
        }

        const newMeal = {
            id: `temp-${Date.now()}-${Math.random()}`,
            day: activeSlot.current.day,
            mealType: activeSlot.current.mealType,
            recipeId: recipe.id,
            recipe: {
                id: recipe.id,
                title: recipe.title,
                imageSrc: recipe.imageSrc,
                ingredients: recipe.ingredients || [],
                description: recipe.description || '',
                user: recipe.user || {},
            },
        };

        const updatedMeals = [...meals, newMeal];
        setMeals(updatedMeals);
        setIsRecipeSelectOpen(false);
        activeSlot.current = null;

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
            refresh();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsSaving(false);
        }
    }, [currentUser, isSaved, planning.id, loginModal, push, refresh, t]);

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
            refresh();
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
        push,
        refresh,
        t,
    ]);

    // Icon helper for meal types
    const getMealIcon = (mealType: string) => {
        switch (mealType.toLowerCase()) {
            case 'breakfast':
                return (
                    <IoMdSunny
                        size={20}
                        className="text-amber-500"
                    />
                );
            case 'lunch':
                return (
                    <IoRestaurantOutline
                        size={20}
                        className="text-emerald-500"
                    />
                );
            case 'dinner':
                return (
                    <IoMdMoon
                        size={20}
                        className="text-indigo-500"
                    />
                );
            case 'snack':
                return (
                    <BiCookie
                        size={20}
                        className="text-rose-500"
                    />
                );
            default:
                return null;
        }
    };

    // Style helper for meal headers
    const getMealHeaderClass = (mealType: string) => {
        switch (mealType.toLowerCase()) {
            case 'breakfast':
                return 'bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300';
            case 'lunch':
                return 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300';
            case 'dinner':
                return 'bg-indigo-50/50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-300';
            case 'snack':
                return 'bg-rose-50/50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300';
            default:
                return 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700';
        }
    };

    return (
        <Container>
            <div className="flex flex-col gap-6 pb-12 md:pt-8 dark:text-white">
                {/* Plan Header & Info */}
                <div className="flex flex-col justify-between gap-6 border-b border-neutral-200 pb-6 md:flex-row md:items-start dark:border-neutral-800">
                    <div className="flex w-full flex-1 flex-col gap-3">
                        {/* Title & Back Button Row */}
                        <div className="flex w-full flex-row items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => push('/plannings')}
                                className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 focus:outline-hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
                                aria-label="Back"
                            >
                                <FiChevronLeft className="text-2xl" />
                            </button>
                            <h1 className="truncate text-3xl font-semibold tracking-tight">
                                {editedName}
                            </h1>
                        </div>

                        {/* Description & Metadata */}
                        <div className="flex flex-col gap-2 pl-12 md:pl-0">
                            {editedDesc && (
                                <p className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                                    {editedDesc}
                                </p>
                            )}

                            <div className="mt-1 flex flex-wrap items-center gap-3">
                                {planning.user && (
                                    <div className="flex flex-row items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-950">
                                        <Avatar
                                            src={planning.user.image}
                                            size={20}
                                        />
                                        <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                            {planning.user.name}
                                        </span>
                                    </div>
                                )}
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {formatDate(
                                        planning.createdAt,
                                        i18n.language
                                    )}
                                </div>

                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={togglePrivacy}
                                        disabled={isSaving}
                                        className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-1.5 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                                        title={
                                            (isPrivate
                                                ? t('private')
                                                : t('public')) || ''
                                        }
                                    >
                                        {isPrivate ? (
                                            <GiPadlock
                                                size={20}
                                                className="text-neutral-700 dark:text-neutral-300"
                                                data-testid="lock-icon"
                                            />
                                        ) : (
                                            <GiPadlockOpen
                                                size={20}
                                                className="text-neutral-700 dark:text-neutral-300"
                                                data-testid="lock-open-icon"
                                            />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 md:pl-0">
                        <button
                            type="button"
                            onClick={() => setIsShoppingListOpen(true)}
                            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                            data-testid="shopping-list-button"
                            title={t('shopping_list') as string}
                        >
                            <FiShoppingCart size={16} />
                            <span className="hidden md:inline">
                                {t('shopping_list')}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsCalendarExportOpen(true)}
                            className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                            data-testid="export-calendar-button"
                            title={t('export_calendar') as string}
                        >
                            <FiDownload size={16} />
                            <span className="hidden md:inline">
                                {t('export_calendar')}
                            </span>
                        </button>

                        {!isPrivate && (
                            <button
                                type="button"
                                onClick={() => share({ title: editedName })}
                                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                                data-testid="share-button"
                                title={t('share') as string}
                            >
                                <FiShare2 size={16} />
                                <span className="hidden md:inline">
                                    {t('share')}
                                </span>
                            </button>
                        )}

                        {!isOwner && (
                            <button
                                type="button"
                                onClick={handleSaveToggle}
                                disabled={isSaving}
                                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                                data-testid="save-plan-button"
                                title={
                                    t(
                                        isSaved
                                            ? 'unsave_plan_action'
                                            : 'save_plan_action'
                                    ) as string
                                }
                            >
                                <FiBookmark
                                    size={16}
                                    className={
                                        isSaved
                                            ? 'fill-current text-neutral-900 dark:text-white'
                                            : ''
                                    }
                                />
                                <span className="hidden md:inline">
                                    {t(
                                        isSaved
                                            ? 'unsave_plan_action'
                                            : 'save_plan_action'
                                    )}
                                </span>
                            </button>
                        )}

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setIsPlanningModalOpen(true)}
                                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-neutral-900 p-2.5 text-sm font-semibold text-white transition hover:opacity-90 md:px-4 md:py-2.5 dark:bg-white dark:text-neutral-900"
                                data-testid="edit-plan-button"
                                title={t('edit_plan') as string}
                            >
                                <AiOutlineEdit size={16} />
                                <span className="hidden md:inline">
                                    {t('edit_plan')}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Week Diet Grid */}
                <div className="flex flex-col gap-8">
                    {DAYS_OF_WEEK.map((day) => {
                        return (
                            <div
                                key={day}
                                className="flex flex-col gap-4 rounded-3xl border border-neutral-200/50 bg-neutral-50/20 p-5 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-950/20"
                            >
                                {/* Day Title */}
                                <h3 className="text-xl font-semibold tracking-tight capitalize">
                                    {t(day)}
                                </h3>

                                {/* 4 Meal Slots Grid */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {MEAL_TYPES.map((mealType) => {
                                        const key = `${day}-${mealType}`;
                                        const slotMeals =
                                            groupedMeals[key] || [];

                                        return (
                                            <div
                                                key={mealType}
                                                data-testid="meal-slot"
                                                className="border-neutral-250 flex min-h-[140px] flex-col overflow-hidden rounded-2xl border bg-white/40 dark:border-neutral-900 dark:bg-neutral-900/30"
                                            >
                                                {/* Meal Slot Header */}
                                                <div
                                                    className={`flex flex-row items-center gap-2 border-b border-inherit px-3 py-2 text-sm font-semibold ${getMealHeaderClass(mealType)}`}
                                                >
                                                    {getMealIcon(mealType)}
                                                    <span className="capitalize">
                                                        {t(mealType)}
                                                    </span>
                                                </div>

                                                {/* Meals Container */}
                                                <div className="flex flex-1 flex-col gap-2 p-2">
                                                    {slotMeals.map((meal) => {
                                                        const recipe =
                                                            meal.recipe;
                                                        if (!recipe)
                                                            return null;

                                                        return (
                                                            <div
                                                                key={meal.id}
                                                                className="group/recipe dark:border-neutral-850 relative flex flex-row items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 transition hover:bg-neutral-50 dark:bg-[#151515] dark:hover:bg-neutral-900"
                                                            >
                                                                <img
                                                                    src={
                                                                        recipe.imageSrc
                                                                    }
                                                                    alt={
                                                                        recipe.title
                                                                    }
                                                                    className="size-10 shrink-0 rounded-lg object-cover"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        push(
                                                                            `/recipes/${recipe.id}`
                                                                        )
                                                                    }
                                                                    className="flex-1 cursor-pointer truncate border-0 bg-transparent pr-6 text-left focus:outline-hidden"
                                                                >
                                                                    <div className="truncate text-xs font-semibold text-neutral-800 hover:underline dark:text-neutral-200">
                                                                        {
                                                                            recipe.title
                                                                        }
                                                                    </div>
                                                                    {recipe.user && (
                                                                        <div className="truncate text-[10px] font-light text-neutral-500 dark:text-neutral-400">
                                                                            by{' '}
                                                                            {recipe
                                                                                .user
                                                                                .name ||
                                                                                'Anonymous'}
                                                                        </div>
                                                                    )}
                                                                </button>

                                                                {/* Remove button in Edit mode */}
                                                                {isOwner && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveRecipe(
                                                                                meal.id
                                                                            )
                                                                        }
                                                                        className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-1 text-neutral-400 opacity-0 transition-opacity duration-200 group-hover/recipe:opacity-100 hover:bg-rose-100 hover:text-rose-500 dark:text-neutral-500 dark:hover:bg-rose-950/40"
                                                                        title={
                                                                            t(
                                                                                'delete'
                                                                            ) ||
                                                                            'Delete'
                                                                        }
                                                                    >
                                                                        <AiOutlineDelete
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Add Recipe Button (in Edit Mode) */}
                                                    {isOwner &&
                                                        slotMeals.length <
                                                            MAX_RECIPES_PER_MEAL && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAddRecipeClick(
                                                                        day,
                                                                        mealType
                                                                    )
                                                                }
                                                                className="dark:border-neutral-850 flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 py-3 text-xs text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900/60 dark:hover:text-white"
                                                                data-testid="add-recipe-button"
                                                            >
                                                                <FiPlus
                                                                    size={14}
                                                                />
                                                                <span>
                                                                    {t(
                                                                        'add_recipe'
                                                                    )}
                                                                </span>
                                                            </button>
                                                        )}

                                                    {!isOwner &&
                                                        slotMeals.length ===
                                                            0 && (
                                                            <div className="flex flex-1 items-center justify-center py-4 text-[11px] font-light text-neutral-400 italic">
                                                                {t(
                                                                    'empty_slot'
                                                                ) ||
                                                                    'No meals scheduled'}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recipe Selection Modal */}
            <RecipeSelectModal
                isOpen={isRecipeSelectOpen}
                onClose={() => {
                    setIsRecipeSelectOpen(false);
                    activeSlot.current = null;
                }}
                onSelect={handleRecipeSelect}
            />

            {/* Shopping List Modal */}
            {/* Planning Modal (for editing metadata) */}
            <PlanningModal
                isOpen={isPlanningModalOpen}
                onClose={() => setIsPlanningModalOpen(false)}
                onSubmit={handleUpdatePlanning}
                title={t('edit_plan') || 'Edit Plan'}
                actionLabel={
                    isSaving
                        ? t('saving') || 'Saving...'
                        : t('save_plan') || 'Save Plan'
                }
                initialValues={{
                    name: editedName,
                    description: editedDesc,
                    isPrivate: isPrivate,
                }}
                isLoading={isSaving}
            />

            {/* Shopping List Modal */}
            <WeeklyShoppingListModal
                isOpen={isShoppingListOpen}
                onClose={() => setIsShoppingListOpen(false)}
                meals={meals}
                planningName={editedName}
            />

            {/* Calendar Export Date Select Modal */}
            <ExportCalendarModal
                isOpen={isCalendarExportOpen}
                onClose={() => setIsCalendarExportOpen(false)}
                planningName={editedName}
                meals={meals}
            />
        </Container>
    );
};

export default PlanningClient;
