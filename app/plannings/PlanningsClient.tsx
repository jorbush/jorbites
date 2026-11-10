'use client';

import React from 'react';
import { BiPlus } from 'react-icons/bi';
import Container from '@/app/components/utils/Container';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import PlanningModal from '@/app/components/modals/PlanningModal';
import TabNavigation from '@/app/components/utils/TabNavigation';
import PlanningsHeader from '@/app/components/plannings/PlanningsHeader';
import PlanningsGrid from '@/app/components/plannings/PlanningsGrid';
import { SafePlanning, SafeUser } from '@/app/types';
import { usePlanningsClient, PlanningsTab } from './usePlanningsClient';

interface PlanningsClientProps {
    initialMyPlannings: SafePlanning[];
    initialCommunityPlannings: SafePlanning[];
    initialSavedPlannings?: SafePlanning[];
    currentUser?: SafeUser | null;
}

const PlanningsClient: React.FC<PlanningsClientProps> = (props) => {
    const { currentUser } = props;
    const {
        activeTab,
        setActiveTab,
        tabs,
        activePlans,
        isCreateOpen,
        setIsCreateOpen,
        isCreating,
        deletePlanId,
        setDeletePlanId,
        handleCreateClick,
        onCreateSubmit,
        onDelete,
        onUnsave,
        push,
        t,
        language,
    } = usePlanningsClient(props);

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                <PlanningsHeader
                    onCreateClick={handleCreateClick}
                    t={t}
                />

                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as PlanningsTab)}
                />

                <div className="mt-2">
                    <PlanningsGrid
                        plans={activePlans}
                        currentUser={currentUser}
                        showDelete={activeTab !== 'community'}
                        isSavedTab={activeTab === 'saved'}
                        showPublicBadge={activeTab === 'my'}
                        onUnsave={onUnsave}
                        onDeleteClick={setDeletePlanId}
                        push={push}
                        t={t}
                        language={language}
                    />
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
