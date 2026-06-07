'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafePlanning, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AiOutlineDelete } from 'react-icons/ai';
import { FcPlanner } from 'react-icons/fc';
import { BiPlus } from 'react-icons/bi';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import useLoginModal from '@/app/hooks/useLoginModal';
import PlanningModal from '@/app/components/modals/PlanningModal';

interface PlanningsClientProps {
    initialMyPlannings: SafePlanning[];
    initialCommunityPlannings: SafePlanning[];
    initialSavedPlannings?: SafePlanning[];
    currentUser?: SafeUser | null;
}

const PlanningsClient: React.FC<PlanningsClientProps> = ({
    initialMyPlannings,
    initialCommunityPlannings,
    initialSavedPlannings,
    currentUser,
}) => {
    const { push, refresh } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const loginModal = useLoginModal();

    const [myPlannings, setMyPlannings] =
        useState<SafePlanning[]>(initialMyPlannings);
    const [communityPlannings, setCommunityPlannings] = useState<
        SafePlanning[]
    >(initialCommunityPlannings);
    const [savedPlannings, setSavedPlannings] = useState<SafePlanning[]>(
        initialSavedPlannings || []
    );

    // Create plan form state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Delete confirmation state
    const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

    // Tab state: 'my', 'saved', or 'community'
    const [activeTab, setActiveTab] = useState<'my' | 'saved' | 'community'>(
        currentUser ? 'my' : 'community'
    );

    useEffect(() => {
        setMyPlannings(initialMyPlannings);
        setCommunityPlannings(initialCommunityPlannings);
        setSavedPlannings(initialSavedPlannings || []);
    }, [initialMyPlannings, initialCommunityPlannings, initialSavedPlannings]);

    const onUnsave = useCallback(
        async (planId: string) => {
            try {
                await axios.delete(`/api/saves/${planId}`);
                toast.success(t('meal_plan_updated'));
                setSavedPlannings((current) =>
                    current.filter((p) => p.id !== planId)
                );
                refresh();
            } catch {
                toast.error(t('something_went_wrong'));
            }
        },
        [push, refresh, t]
    );

    const handleCreateClick = useCallback(() => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        setIsCreateOpen(true);
    }, [currentUser, loginModal]);

    const onCreateSubmit = async (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => {
        setIsCreating(true);
        try {
            const response = await axios.post('/api/plannings', {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate,
            });
            toast.success(t('meal_plan_created'));
            setIsCreateOpen(false);
            push(`/plannings/${response.data.id}`);
            refresh();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setIsCreating(false);
        }
    };

    const onDelete = useCallback(async () => {
        if (!deletePlanId) return;

        try {
            await axios.delete(`/api/plannings/${deletePlanId}`);
            toast.success(t('meal_plan_deleted'));
            setMyPlannings((current) =>
                current.filter((p) => p.id !== deletePlanId)
            );
            setCommunityPlannings((current) =>
                current.filter((p) => p.id !== deletePlanId)
            );
            refresh();
        } catch {
            toast.error(t('something_went_wrong'));
        } finally {
            setDeletePlanId(null);
        }
    }, [deletePlanId, push, refresh, t]);

    // Unique recipes extraction for card preview
    const getPreviewRecipes = (plan: SafePlanning) => {
        if (!plan.meals) return [];
        const unique: any[] = [];
        const seen = new Set();
        for (const meal of plan.meals) {
            if (meal.recipe && !seen.has(meal.recipe.id)) {
                seen.add(meal.recipe.id);
                unique.push(meal.recipe);
            }
        }
        return unique.slice(0, 4);
    };

    const renderGrid = (
        plans: SafePlanning[],
        showDelete = false,
        isSavedTab = false
    ) => {
        if (plans.length === 0) {
            return (
                <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-10 text-neutral-500 dark:border-neutral-700">
                    <p className="text-lg font-light">{t('no_meal_plans')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {plans.map((plan) => {
                    const previews = getPreviewRecipes(plan);
                    const totalMealsCount = plan.meals?.length || 0;
                    return (
                        <button
                            key={plan.id}
                            type="button"
                            onClick={() => push(`/plannings/${plan.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    push(`/plannings/${plan.id}`);
                                }
                            }}
                            className="group relative flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/50 p-5 text-left shadow-xs backdrop-blur-xs transition duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-xl dark:border-neutral-800/60 dark:bg-[#121212]/50 dark:hover:bg-[#181818]"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <div className="truncate text-xl font-semibold text-neutral-900 group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
                                        {plan.name}
                                    </div>
                                    {showDelete && (
                                        <button
                                            type="button"
                                            className="rounded-full p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                                            title={t('delete') || 'Delete'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (
                                                    isSavedTab &&
                                                    plan.userId !==
                                                        currentUser?.id
                                                ) {
                                                    onUnsave(plan.id);
                                                } else {
                                                    setDeletePlanId(plan.id);
                                                }
                                            }}
                                        >
                                            <AiOutlineDelete size={18} />
                                        </button>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
                                    {plan.description ||
                                        t('no_description') ||
                                        'No description'}
                                </p>
                            </div>

                            <div className="mt-5 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                        {t('PREVIEW_RECIPES') ||
                                            'Recipes Preview'}
                                    </span>
                                    <div className="flex flex-row items-center overflow-hidden py-1">
                                        {previews.map((recipe: any) => (
                                            <img
                                                key={recipe.id}
                                                src={recipe.imageSrc}
                                                alt={recipe.title}
                                                className="-ml-3 inline-block size-8 rounded-full object-cover ring-2 ring-white transition-all group-hover:scale-105 first:ml-0 dark:ring-neutral-900"
                                                title={recipe.title}
                                            />
                                        ))}
                                        {previews.length === 0 && (
                                            <span className="text-xs font-light text-neutral-400 italic">
                                                {t('no_recipes_yet')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center gap-1.5">
                                            {plan.isPrivate ? (
                                                <GiPadlock
                                                    size={14}
                                                    className="text-neutral-400"
                                                />
                                            ) : (
                                                <GiPadlockOpen
                                                    size={14}
                                                    className="text-neutral-400"
                                                />
                                            )}
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                {totalMealsCount} {t('meals')}
                                            </span>
                                        </div>
                                        {plan.user && (
                                            <div className="flex flex-row items-center gap-1.5">
                                                <Avatar
                                                    src={plan.user.image}
                                                    size={18}
                                                />
                                                <span className="max-w-[80px] truncate text-xs font-light text-neutral-500 dark:text-neutral-400">
                                                    {plan.user.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-right text-[10px] font-light text-neutral-400">
                                        {formatDate(
                                            plan.createdAt,
                                            i18n.language
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };
    return (
        <Container>
            <div className="flex flex-col gap-8 pb-12 md:pt-8 dark:text-white">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-row items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 dark:bg-neutral-900">
                            <FcPlanner size={40} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {t('meal_planner')}
                            </h1>
                            <p className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                                {t('meal_planner_subtitle') ||
                                    'Design, customize, and share your week diets with the community.'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        data-testid="create-meal-plan-button"
                    >
                        <BiPlus size={20} />
                        <span>{t('create_meal_plan')}</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                    {currentUser && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('my')}
                            className={`cursor-pointer border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
                                activeTab === 'my'
                                    ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                            }`}
                        >
                            {t('my_meal_plans')}
                        </button>
                    )}
                    {currentUser && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('saved')}
                            className={`cursor-pointer border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
                                activeTab === 'saved'
                                    ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                            }`}
                        >
                            {t('saved_meal_plans') || 'Saved Plans'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setActiveTab('community')}
                        className={`cursor-pointer border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
                            activeTab === 'community'
                                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white'
                                : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                        }`}
                    >
                        {t('community_meal_plans')}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-2">
                    {activeTab === 'my' && renderGrid(myPlannings, true)}
                    {activeTab === 'saved' &&
                        renderGrid(savedPlannings, true, true)}
                    {activeTab === 'community' &&
                        renderGrid(communityPlannings, false)}
                </div>
            </div>

            {/* Create Planning Modal */}
            <PlanningModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={onCreateSubmit}
                title={t('create_meal_plan') || 'Create Meal Plan'}
                actionLabel={
                    isCreating
                        ? t('creating') || 'Creating...'
                        : t('create') || 'Create'
                }
                isLoading={isCreating}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={!!deletePlanId}
                setIsOpen={(open) => {
                    if (!open) setDeletePlanId(null);
                }}
                onConfirm={onDelete}
                description={
                    t('delete_meal_plan_confirmation') ||
                    'Are you sure you want to delete this meal plan?'
                }
            />
        </Container>
    );
};

export default PlanningsClient;
