'use client';

import axios from 'axios';
import { useCallback, useEffect, useState, useReducer } from 'react';
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
import { planningsReducer } from './planningsReducer';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';

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

    const [state, dispatch] = useReducer(planningsReducer, {
        my: initialMyPlannings,
        community: initialCommunityPlannings,
        saved: initialSavedPlannings || [],
    });
    const {
        my: myPlannings,
        community: communityPlannings,
        saved: savedPlannings,
    } = state;

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
        dispatch({
            type: 'SYNC',
            payload: {
                my: initialMyPlannings,
                community: initialCommunityPlannings,
                saved: initialSavedPlannings || [],
            },
        });
    }, [initialMyPlannings, initialCommunityPlannings, initialSavedPlannings]);

    const onUnsave = useCallback(
        async (planId: string) => {
            try {
                await axios.delete(`/api/saves/${planId}`);
                toast.success(t('meal_plan_updated'));
                dispatch({ type: 'UNSAVE', payload: planId });
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
            dispatch({ type: 'DELETE', payload: deletePlanId });
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
                <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <p className="text-sm font-medium">{t('no_meal_plans')}</p>
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

    const tabs: NavigationTab[] = [
        ...(currentUser ? [{ id: 'my', label: t('my_meal_plans') }] : []),
        ...(currentUser
            ? [{ id: 'saved', label: t('saved_meal_plans') || 'Saved Plans' }]
            : []),
        { id: 'community', label: t('community_meal_plans') },
    ];

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-row items-center gap-3.5">
                        <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <FcPlanner size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                {t('meal_planner')}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('meal_planner_subtitle') ||
                                    'Design, customize, and share your week diets with the community.'}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block md:flex-shrink-0">
                        <button
                            type="button"
                            onClick={handleCreateClick}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                            data-testid="create-meal-plan-button"
                            data-cy="create-meal-plan-button"
                        >
                            <BiPlus size={18} />
                            <span>{t('create_meal_plan')}</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) =>
                        setActiveTab(tabId as 'my' | 'saved' | 'community')
                    }
                />

                {/* Tab Content */}
                <div className="mt-2">
                    {activeTab === 'my' && renderGrid(myPlannings, true)}
                    {activeTab === 'saved' &&
                        renderGrid(savedPlannings, true, true)}
                    {activeTab === 'community' &&
                        renderGrid(communityPlannings, false)}
                </div>
            </div>

            {/* Floating Action Button for mobile (below md) */}
            <button
                type="button"
                onClick={handleCreateClick}
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-testid="create-meal-plan-button-mobile"
                data-cy="create-meal-plan-button-mobile"
                aria-label={t('create_meal_plan') as string}
            >
                <BiPlus className="size-6" />
            </button>

            {/* Create Planning Modal */}
            <PlanningModal
                key={isCreateOpen ? 'open' : 'closed'}
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
