'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { SafePlanning, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FcPlanner } from 'react-icons/fc';
import { BiPlus } from 'react-icons/bi';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import PlanningModal from '@/app/components/modals/PlanningModal';
import { PlanningCard } from '@/app/components/plannings/PlanningCard';

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
        [refresh, t]
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
    }, [deletePlanId, refresh, t]);

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
                {plans.map((plan) => (
                    <PlanningCard
                        key={plan.id}
                        plan={plan}
                        currentUser={currentUser}
                        showDelete={showDelete}
                        isSavedTab={isSavedTab}
                        onUnsave={onUnsave}
                        onDeleteClick={setDeletePlanId}
                        push={push}
                        t={t}
                        language={i18n.language}
                    />
                ))}
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
