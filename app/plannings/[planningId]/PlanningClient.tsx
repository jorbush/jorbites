'use client';

import { SafePlanning, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeSelectModal from '@/app/components/modals/RecipeSelectModal';
import PlanningModal from '@/app/components/modals/PlanningModal';
import WeeklyShoppingListModal from '@/app/components/modals/WeeklyShoppingListModal';
import ExportCalendarModal from '@/app/components/modals/ExportCalendarModal';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import { usePlanningState } from '@/app/components/plannings/usePlanningState';
import { PlanningHeader } from '@/app/components/plannings/PlanningHeader';
import { PlanningActions } from '@/app/components/plannings/PlanningActions';
import { PlanningDayCard } from '@/app/components/plannings/PlanningDayCard';
import { DAYS_OF_WEEK } from '@/app/utils/constants';
import { FiChevronLeft } from 'react-icons/fi';

interface PlanningClientProps {
    planning: SafePlanning;
    currentUser?: SafeUser | null;
}

const PlanningClient: React.FC<PlanningClientProps> = ({
    planning,
    currentUser,
}) => {
    const {
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
        meals,
        isSaving,
        isRecipeSelectOpen,
        setIsRecipeSelectOpen,
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
        setActiveSlot,
    } = usePlanningState({ planning, currentUser });

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Top Navigation & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => (back ? back() : push('/plannings'))}
                        className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        aria-label={t('back') || 'Back'}
                        data-cy="back-button"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                            <FiChevronLeft size={18} />
                        </div>
                        <span>{t('back') || 'Back'}</span>
                    </button>

                    {/* Planning Actions */}
                    <PlanningActions
                        statusFlags={{
                            isOwner,
                            isPrivate,
                            isSaved,
                            isSaving,
                        }}
                        editedName={editedName}
                        onShoppingListOpen={() => setIsShoppingListOpen(true)}
                        onCalendarExportOpen={() =>
                            setIsCalendarExportOpen(true)
                        }
                        onPlanningModalOpen={() => setIsPlanningModalOpen(true)}
                        handleSaveToggle={handleSaveToggle}
                        togglePrivacy={togglePrivacy}
                        onDelete={() => setIsConfirmDeleteOpen(true)}
                        share={share}
                        t={t}
                    />
                </div>

                {/* Plan Header Card */}
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                    <PlanningHeader
                        editedName={editedName}
                        editedDesc={editedDesc}
                        planning={planning}
                        language={i18n.language}
                        isOwner={isOwner}
                        isPrivate={isPrivate}
                        isSaving={isSaving}
                        togglePrivacy={togglePrivacy}
                        push={push}
                        t={t}
                        mealsCount={meals.length}
                        showLock={false}
                    />
                </div>

                {/* Week Diet Grid */}
                <div className="flex flex-col gap-6">
                    {DAYS_OF_WEEK.map((day) => (
                        <PlanningDayCard
                            key={day}
                            day={day}
                            groupedMeals={groupedMeals}
                            isOwner={isOwner}
                            onAddRecipeClick={handleAddRecipeClick}
                            onRemoveRecipe={handleRemoveRecipe}
                            push={push}
                            t={t}
                        />
                    ))}
                </div>
            </div>

            {/* Recipe Selection Modal */}
            <RecipeSelectModal
                isOpen={isRecipeSelectOpen}
                onClose={() => {
                    setIsRecipeSelectOpen(false);
                    setActiveSlot(null);
                }}
                onSelect={handleRecipeSelect}
            />

            {/* Shopping List Modal */}
            {/* Planning Modal (for editing metadata) */}
            <PlanningModal
                key={isPlanningModalOpen ? 'open' : 'closed'}
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isConfirmDeleteOpen}
                setIsOpen={setIsConfirmDeleteOpen}
                onConfirm={handleDeletePlanning}
                description={
                    t('delete_meal_plan_confirmation') ||
                    'Are you sure you want to delete this meal plan?'
                }
            />
        </Container>
    );
};

export default PlanningClient;
