'use client';

import { SafePlanning, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeSelectModal from '@/app/components/modals/RecipeSelectModal';
import PlanningModal from '@/app/components/modals/PlanningModal';
import WeeklyShoppingListModal from '@/app/components/modals/WeeklyShoppingListModal';
import ExportCalendarModal from '@/app/components/modals/ExportCalendarModal';
import { usePlanningState } from '@/app/components/plannings/usePlanningState';
import { PlanningHeader } from '@/app/components/plannings/PlanningHeader';
import { PlanningActions } from '@/app/components/plannings/PlanningActions';
import { PlanningDayCard } from '@/app/components/plannings/PlanningDayCard';
import { DAYS_OF_WEEK } from '@/app/utils/constants';

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
        groupedMeals,
        handleUpdatePlanning,
        handleAddRecipeClick,
        handleRecipeSelect,
        handleRemoveRecipe,
        handleSaveToggle,
        togglePrivacy,
        setActiveSlot,
    } = usePlanningState({ planning, currentUser });

    return (
        <Container>
            <div className="flex flex-col gap-6 pb-12 md:pt-8 dark:text-white">
                {/* Plan Header & Info */}
                <div className="flex flex-col justify-between gap-6 border-b border-neutral-200 pb-6 md:flex-row md:items-start dark:border-neutral-800">
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
                    />

                    <PlanningActions
                        statusFlags={{ isOwner, isPrivate, isSaved, isSaving }}
                        editedName={editedName}
                        onShoppingListOpen={() => setIsShoppingListOpen(true)}
                        onCalendarExportOpen={() =>
                            setIsCalendarExportOpen(true)
                        }
                        onPlanningModalOpen={() => setIsPlanningModalOpen(true)}
                        handleSaveToggle={handleSaveToggle}
                        share={share}
                        t={t}
                    />
                </div>

                {/* Week Diet Grid */}
                <div className="flex flex-col gap-8">
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
        </Container>
    );
};

export default PlanningClient;
